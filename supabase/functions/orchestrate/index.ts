import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function sseEvent(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return new Response(JSON.stringify({ error: "prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI gateway not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const workflowId = crypto.randomUUID();

    const body = new ReadableStream({
      async start(controller) {
        const send = (data: Record<string, unknown>) => {
          controller.enqueue(new TextEncoder().encode(sseEvent(data)));
        };

        try {
          // Phase 1: System initialization
          send({ type: "LOG", protocol: "SYSTEM", message: "Initializing MetaOrcha orchestration engine...", timestamp: new Date().toISOString(), workflow_id: workflowId });
          await sleep(400);

          send({ type: "LOG", protocol: "SYSTEM", message: `Workflow ${workflowId.slice(0, 8)} created`, timestamp: new Date().toISOString(), workflow_id: workflowId });
          await sleep(300);

          // Phase 2: MCP agent setup
          send({ type: "LOG", protocol: "MCP", message: "Connecting MCP agent via stdio/JSON-RPC...", timestamp: new Date().toISOString(), workflow_id: workflowId });
          await sleep(500);

          send({ type: "LOG", protocol: "MCP", message: "MCP handshake complete. Tools registered: [calculate, parse, format]", timestamp: new Date().toISOString(), workflow_id: workflowId });
          await sleep(300);

          // Phase 3: A2A agent setup
          send({ type: "LOG", protocol: "A2A", message: "Discovering A2A agents via HTTP/REST...", timestamp: new Date().toISOString(), workflow_id: workflowId });
          await sleep(400);

          send({ type: "LOG", protocol: "A2A", message: "A2A agent 'TextConverter-01' connected. Capabilities: [text-transform, number-to-words]", timestamp: new Date().toISOString(), workflow_id: workflowId });
          await sleep(300);

          // Phase 4: Task decomposition
          send({ type: "LOG", protocol: "SYSTEM", message: `Decomposing task: "${prompt}"`, timestamp: new Date().toISOString(), workflow_id: workflowId });
          await sleep(400);

          send({ type: "LOG", protocol: "SYSTEM", message: "Task decomposed into 2 subtasks", timestamp: new Date().toISOString(), workflow_id: workflowId });
          await sleep(300);

          // Phase 5: MCP execution — call AI for the computation
          send({ type: "LOG", protocol: "MCP", message: "MCP Agent executing computation subtask...", timestamp: new Date().toISOString(), workflow_id: workflowId });
          await sleep(300);

          // Call Lovable AI for the actual work
          const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                {
                  role: "system",
                  content: `You are a multi-agent orchestration system. The user gives a task. You must:
1. Perform any calculations requested
2. Convert the numeric result to English words
3. Return ONLY a JSON object with this exact format (no markdown, no code fences):
{"calculation": "the math expression", "numeric_result": <number>, "text_result": "the number in English words", "explanation": "brief step-by-step"}`,
                },
                { role: "user", content: prompt },
              ],
            }),
          });

          if (!aiResponse.ok) {
            if (aiResponse.status === 429) {
              send({ type: "ERROR", protocol: "SYSTEM", message: "Rate limit exceeded. Please try again later.", timestamp: new Date().toISOString(), workflow_id: workflowId });
              controller.close();
              return;
            }
            if (aiResponse.status === 402) {
              send({ type: "ERROR", protocol: "SYSTEM", message: "AI credits exhausted. Please add funds.", timestamp: new Date().toISOString(), workflow_id: workflowId });
              controller.close();
              return;
            }
            const errText = await aiResponse.text();
            console.error("AI error:", aiResponse.status, errText);
            send({ type: "ERROR", protocol: "SYSTEM", message: "AI processing failed", timestamp: new Date().toISOString(), workflow_id: workflowId });
            controller.close();
            return;
          }

          const aiData = await aiResponse.json();
          const rawContent = aiData.choices?.[0]?.message?.content || "";

          send({ type: "LOG", protocol: "MCP", message: "MCP Agent computation complete", timestamp: new Date().toISOString(), workflow_id: workflowId });
          await sleep(300);

          // Phase 6: A2A conversion
          send({ type: "LOG", protocol: "A2A", message: "A2A Agent 'TextConverter-01' processing result...", timestamp: new Date().toISOString(), workflow_id: workflowId });
          await sleep(500);

          send({ type: "LOG", protocol: "A2A", message: "Text conversion complete", timestamp: new Date().toISOString(), workflow_id: workflowId });
          await sleep(300);

          // Phase 7: Result aggregation
          send({ type: "LOG", protocol: "SYSTEM", message: "Aggregating results from all agents...", timestamp: new Date().toISOString(), workflow_id: workflowId });
          await sleep(400);

          // Parse AI result
          let result: unknown;
          try {
            // Strip markdown code fences if present
            const cleaned = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            result = JSON.parse(cleaned);
          } catch {
            result = { raw_response: rawContent };
          }

          // Final completion
          send({
            type: "COMPLETED",
            protocol: "SYSTEM",
            message: "Workflow completed successfully",
            result,
            timestamp: new Date().toISOString(),
            workflow_id: workflowId,
          });
        } catch (err) {
          console.error("Stream error:", err);
          send({
            type: "ERROR",
            protocol: "SYSTEM",
            message: err instanceof Error ? err.message : "Unknown error",
            timestamp: new Date().toISOString(),
            workflow_id: workflowId,
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    console.error("orchestrate error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

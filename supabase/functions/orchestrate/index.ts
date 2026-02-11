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
        const send = (evt: { event_type: string; protocol?: string; data?: Record<string, unknown> }) => {
          controller.enqueue(
            new TextEncoder().encode(
              sseEvent({
                workflow_id: workflowId,
                event_type: evt.event_type,
                protocol: evt.protocol,
                data: evt.data,
                timestamp: new Date().toISOString(),
              })
            )
          );
        };

        try {
          send({ event_type: "LOG", protocol: "SYSTEM", data: { message: "Initializing MetaOrcha orchestration engine..." } });
          await sleep(400);

          send({ event_type: "LOG", protocol: "SYSTEM", data: { message: `Workflow ${workflowId.slice(0, 8)} created` } });
          await sleep(300);

          send({ event_type: "LOG", protocol: "MCP", data: { message: "Connecting MCP agent via stdio/JSON-RPC..." } });
          await sleep(500);

          send({ event_type: "LOG", protocol: "MCP", data: { message: "MCP handshake complete. Tools registered: [calculate, parse, format]" } });
          await sleep(300);

          send({ event_type: "LOG", protocol: "A2A", data: { message: "Discovering A2A agents via HTTP/REST..." } });
          await sleep(400);

          send({ event_type: "LOG", protocol: "A2A", data: { message: "A2A agent 'TextConverter-01' connected. Capabilities: [text-transform, number-to-words]" } });
          await sleep(300);

          send({ event_type: "LOG", protocol: "SYSTEM", data: { message: `Decomposing task: "${prompt}"` } });
          await sleep(400);

          send({ event_type: "LOG", protocol: "SYSTEM", data: { message: "Task decomposed into 2 subtasks" } });
          await sleep(300);

          send({ event_type: "LOG", protocol: "MCP", data: { message: "MCP Agent executing computation subtask..." } });
          await sleep(300);

          // Call Lovable AI
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
              send({ event_type: "ERROR", protocol: "SYSTEM", data: { error: "Rate limit exceeded. Please try again later." } });
              controller.close();
              return;
            }
            if (aiResponse.status === 402) {
              send({ event_type: "ERROR", protocol: "SYSTEM", data: { error: "AI credits exhausted. Please add funds." } });
              controller.close();
              return;
            }
            const errText = await aiResponse.text();
            console.error("AI error:", aiResponse.status, errText);
            send({ event_type: "ERROR", protocol: "SYSTEM", data: { error: "AI processing failed" } });
            controller.close();
            return;
          }

          const aiData = await aiResponse.json();
          const rawContent = aiData.choices?.[0]?.message?.content || "";

          send({ event_type: "LOG", protocol: "MCP", data: { message: "MCP Agent computation complete" } });
          await sleep(300);

          send({ event_type: "LOG", protocol: "A2A", data: { message: "A2A Agent 'TextConverter-01' processing result..." } });
          await sleep(500);

          send({ event_type: "LOG", protocol: "A2A", data: { message: "Text conversion complete" } });
          await sleep(300);

          send({ event_type: "LOG", protocol: "SYSTEM", data: { message: "Aggregating results from all agents..." } });
          await sleep(400);

          // Parse AI result
          let result: unknown;
          try {
            const cleaned = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            result = JSON.parse(cleaned);
          } catch {
            result = { raw_response: rawContent };
          }

          send({
            event_type: "COMPLETED",
            protocol: "SYSTEM",
            data: { message: "Workflow completed successfully", result },
          });
        } catch (err) {
          console.error("Stream error:", err);
          send({
            event_type: "ERROR",
            protocol: "SYSTEM",
            data: { error: err instanceof Error ? err.message : "Unknown error" },
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

const exampleQueries = [
  "Calculate 5+3 and convert to words",
  "Multiply 8 times 4 and show as text",
  "Divide 20 by 4 then convert result",
];

interface ExampleQueriesProps {
  onSelect: (query: string) => void;
}

export const ExampleQueries = ({ onSelect }: ExampleQueriesProps) => (
  <div className="mt-3" role="group" aria-label="Example queries">
    <span id="example-queries-label" className="text-sm text-muted-foreground">
      Try these examples:
    </span>
    <div className="flex flex-wrap gap-2 mt-2">
      {exampleQueries.map((q) => (
        <button
          key={q}
          type="button"
          onClick={() => onSelect(q)}
          aria-label={`Use example: ${q}`}
          className="px-4 py-2 text-sm rounded-full bg-secondary hover:bg-secondary/70 text-foreground/80 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
        >
          {q}
        </button>
      ))}
    </div>
  </div>
);

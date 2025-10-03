import { useEffect, useState } from 'react';
import mermaid from 'mermaid/dist/mermaid.esm.mjs';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose'
});

export default function ApiFlow() {
  const [tab, setTab] = useState('flow'); // 'flow' | 'sequence'
  const [svg, setSvg] = useState('');
  const [err, setErr] = useState('');

  // ✅ Working system flow (no parentheses; ASCII arrows; explicit newlines)
  const flowChart =
    "graph LR\n" +
    "  A[Client UI - React]\n" +
    "  B[API - Express]\n" +
    "  C[(Postgres DB)]\n" +
    "\n" +
    "  A --> B\n" +
    "  B --> C\n" +
    "  A -.-> C\n";

  // ✅ Safe sequence diagram: no parentheses in participant labels; simple ASCII text
  const sequenceChart =
    "sequenceDiagram\n" +
    "  participant U as User Browser\n" +
    "  participant C as Client UI React\n" +
    "  participant A as API Express\n" +
    "  participant D as DB Postgres\n" +
    "\n" +
    "  U->>C: Open page or type search\n" +
    "  C->>A: GET /api/employees q=eng\n" +
    "  A->>D: SELECT with ILIKE\n" +
    "  D-->>A: rows\n" +
    "  A-->>C: 200 OK JSON\n" +
    "  C-->>U: Render table\n" +
    "\n" +
    "  U->>C: Submit form first and last name\n" +
    "  C->>A: POST /api/employees JSON\n" +
    "  A->>D: INSERT with NULLIF for dates\n" +
    "  D-->>A: returning row\n" +
    "  A-->>C: 201 Created JSON\n" +
    "  C-->>U: Show updated list\n";

  useEffect(() => {
    const render = async () => {
      try {
        setErr('');
        const def = (tab === 'flow' ? flowChart : sequenceChart);
        mermaid.parse(def); // validate first
        const { svg } = await mermaid.render(`graph-${tab}`, def);
        setSvg(svg);
      } catch (e) {
        console.error('Mermaid parse/render error:', e);
        setSvg('');
        setErr('Mermaid failed to render the diagram.');
      }
    };
    render();
  }, [tab]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setTab('flow')}
          className={`px-3 py-2 rounded-xl text-sm shadow ${tab === 'flow' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
        >
          System Flow
        </button>
        <button
          onClick={() => setTab('sequence')}
          className={`px-3 py-2 rounded-xl text-sm shadow ${tab === 'sequence' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
        >
          Sequence
        </button>
      </div>

      <div className="rounded-2xl bg-white shadow p-4 overflow-auto">
        {err ? <div className="text-red-600 text-sm">{err}</div> : <div dangerouslySetInnerHTML={{ __html: svg }} />}
      </div>

      <p className="text-sm text-gray-500">
        This diagram is generated with Mermaid and reflects the actual endpoints used in this app.
      </p>
    </div>
  );
}


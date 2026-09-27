import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  BookOpen,
  FileCheck,
  Send,
  Bot,
  User as UserIcon,
  CheckCircle2,
  FileText,
} from 'lucide-react';

interface SpecQuery {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  citedClauses?: string[];
}

export const AiSpecSearchView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<SpecQuery[]>([
    {
      id: 'm-1',
      sender: 'assistant',
      text: 'Welcome to TechFlow AI Specification Assistant. I can search contract specifications, Dubai Building Code, ACI 318-19 structural concrete tolerances, BS EN standards, and civil defense requirements for your project.',
      timestamp: '08:00',
    },
    {
      id: 'm-2',
      sender: 'user',
      text: 'What are the required curing time and compressive cylinder test schedules for Grade C70 concrete with silica fume?',
      timestamp: '08:02',
    },
    {
      id: 'm-3',
      sender: 'assistant',
      text: 'Based on Project Spec Section 03300 (Cast-in-Place Concrete) Clause 3.12 and ACI 308.1:\n\n1. Minimum Continuous Moist Curing: 7 days continuous wet burlap and polythene sheeting or approved curing membrane conforming to ASTM C309 Type 1-D.\n2. Compressive Strength Cylinders: 6 cylinders per 50 m³ (or each pour):\n   - 2 tested at 7 days (target ≥ 70% of 28d f\'c = 49 MPa)\n   - 2 tested at 28 days (target ≥ 70 MPa)\n   - 2 retain as reserve / 56d durability backup if early strength gains are delayed by silica fume hydration.',
      timestamp: '08:03',
      citedClauses: ['Project Spec 03300 Cl. 3.12', 'ACI 308.1 Standard for Curing', 'ASTM C309'],
    },
  ]);
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    'What is the maximum allowed PT tendon friction loss under BS EN 1992-1-1?',
    'What fire rating is mandated by Dubai Civil Defense for atrium smoke dampers?',
    'What are the minimum lap lengths for 25mm Grade 500B deformed rebar in tension?',
  ];

  const handleSend = (textToSend: string = query) => {
    if (!textToSend.trim()) return;

    const userMsg: SpecQuery = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    setTimeout(() => {
      let answer = '';
      let clauses: string[] = [];

      if (textToSend.toLowerCase().includes('pt tendon') || textToSend.toLowerCase().includes('friction')) {
        answer =
          'According to BS EN 1992-1-1 (Eurocode 2) Clause 5.10.5.2 & Project Spec Section 03380:\n\n- Wobble coefficient (k): 0.005 to 0.010 rad/m for steel ducts.\n- Friction coefficient (μ): 0.19 for strand in corrugated galvanized duct.\n- Total angular displacement θ and tendon elongation must be cross-checked against actual jacking logs with ±5% allowable gauge variance.';
        clauses = ['BS EN 1992-1-1 Cl. 5.10.5.2', 'Spec Section 03380 Post-Tensioning'];
      } else if (textToSend.toLowerCase().includes('fire') || textToSend.toLowerCase().includes('damper')) {
        answer =
          'Under UAE Fire & Life Safety Code of Practice (Chapter 9) and Project Spec Section 15900:\n\n- Motorized smoke and fire dampers in vertical shafts must be 2-hour fire rated (BS 476 Part 20 or UL 555).\n- Dampers must close automatically on receipt of optical smoke detector alarm via the Central Fire Alarm Control Panel (FACP).';
        clauses = ['UAE Fire & Life Safety Code 2018 Ch. 9', 'Spec Section 15900 HVAC Controls'];
      } else {
        answer =
          'Per Project Specifications Section 03200 (Concrete Reinforcement) and ACI 318-19 Table 25.4.2.2:\n\n- Minimum tension lap length for Dia 25mm Grade 500B rebar in C40/50 concrete is 54 × bar diameter = 1,350 mm.\n- For top bars (where >300mm fresh concrete is cast beneath), apply a 1.3 multiplier = 1,755 mm.\n- Mechanical couplers (Class A / Type 2) must be used where rebar congestion exceeds 4% steel ratio.';
        clauses = ['ACI 318-19 Table 25.4.2.2', 'Spec 03200 Cl. 2.04'];
      }

      const botMsg: SpecQuery = {
        id: `b-${Date.now()}`,
        sender: 'assistant',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citedClauses: clauses,
      };

      setMessages((prev) => [...prev, botMsg]);
      setLoading(false);
    }, 700);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white">AI Specification & Code Assistant</h1>
            <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400 font-mono">
              Grounding: Project Specs & ACI / BS / DCD
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Ask technical compliance questions, verify tolerances, and retrieve clause references in seconds.
          </p>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
        <span className="text-[11px] font-semibold text-slate-500 shrink-0">Sample Queries:</span>
        {samplePrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p)}
            className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-300 hover:border-blue-500/50 hover:bg-slate-800 truncate max-w-xs transition"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${
              m.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              }`}
            >
              {m.sender === 'user' ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            <div
              className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-950 border border-slate-800 text-slate-200'
              }`}
            >
              <div className="whitespace-pre-line font-sans">{m.text}</div>

              {m.citedClauses && m.citedClauses.length > 0 && (
                <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-slate-400 font-semibold">Cited Clauses:</span>
                  {m.citedClauses.map((c, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-[10px] text-blue-300 font-mono"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}

              <div
                className={`text-[10px] ${
                  m.sender === 'user' ? 'text-blue-200 text-right' : 'text-slate-500'
                }`}
              >
                {m.timestamp}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 pl-11">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-ping" />
            <span>Consulting project specification documents & building codes...</span>
          </div>
        )}
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything about specifications, test frequencies, tolerances, or standards..."
          className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-xs text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-3 text-xs font-semibold text-white shadow hover:bg-blue-500 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          <span>Ask</span>
        </button>
      </form>
    </div>
  );
};

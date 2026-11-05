import React, { useEffect, useRef, useState } from 'react';
import { askAI } from '../services/aiEngine.js';

const QUICK = [
  'What is the risk here?',
  'Where is the nearest shelter?',
  'What do I do in a flood?',
  'Earthquake safety tips',
  'What should I pack?',
];

const WELCOME = {
  from: 'bot',
  text: "🎃 Boo! I'm Survora. Ask me about the current risk, shelters, or what to do in a disaster.",
};

// Chat window. `context` tells the AI which region the user is looking at.
export default function ChatBot({ context }) {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  async function send(text) {
    const q = text.trim();
    if (!q || busy) return;
    setMessages((m) => [...m, { from: 'me', text: q }]);
    setInput('');
    setBusy(true);
    const reply = await askAI(q, context);
    setMessages((m) => [...m, { from: 'bot', text: reply.text, source: reply.source }]);
    setBusy(false);
  }

  return (
    <div className="card chat">
      <div className="chat-log" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.from}`}>
            {m.text}
            {m.source === 'aws' && <span className="badge">via AWS</span>}
          </div>
        ))}
        {busy && (
          <div className="bubble bot typing">
            <span /> <span /> <span />
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="chips">
        {QUICK.map((q) => (
          <button key={q} className="chip" onClick={() => send(q)} disabled={busy}>
            {q}
          </button>
        ))}
      </div>

      <form
        className="chat-form"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the spirits..."
          aria-label="Your question"
        />
        <button className="btn" type="submit" disabled={busy || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

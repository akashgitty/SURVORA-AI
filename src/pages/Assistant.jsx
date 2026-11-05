import React from 'react';
import ChatBot from '../components/ChatBot.jsx';

// "Ask Survora": chat page. The chat receives the current region as context.
export default function Assistant({ context }) {
  return (
    <div className="page narrow">
      <div className="page-head">
        <div>
          <h2 className="page-title">Ask Survora</h2>
          <p className="muted">
            Your spectral guide for {context.region.name}. Ask about risks, shelters or what to do.
          </p>
        </div>
      </div>
      <ChatBot context={context} />
    </div>
  );
}

import './App.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8080';

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState([]);
  const messagesEndRef = useRef(null);

  const socket = useMemo(() => io(API_BASE, { autoConnect: false }), []);

  useEffect(() => {
    async function init() {
      const { data } = await axios.post(`${API_BASE}/api/session`);
      setSessionId(data.sessionId);
      socket.connect();
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    socket.on('connect', () => {
      // join personal room by socket.id for streaming
    });
    socket.on('chat:token', ({ token }) => {
      setMessages((prev) => {
        const copy = [...prev];
        if (copy.length && copy[copy.length - 1].role === 'assistant') {
          copy[copy.length - 1] = { ...copy[copy.length - 1], content: (copy[copy.length - 1].content || '') + token };
        } else {
          copy.push({ role: 'assistant', content: token });
        }
        return copy;
      });
    });
    return () => {
      socket.off('chat:token');
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || !sessionId) return;
    const userMsg = { role: 'user', content: input };
    setMessages((m) => [...m, userMsg, { role: 'assistant', content: '' }]);
    const toSend = input;
    setInput('');
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/api/chat`, {
        sessionId,
        message: toSend,
        socketId: socket.id,
      });
      setSources(data.sources || []);
      // If not streamed, replace placeholder
      if (data.answer) {
        setMessages((prev) => {
          const copy = [...prev];
          // find last assistant placeholder
          for (let i = copy.length - 1; i >= 0; i--) {
            if (copy[i].role === 'assistant') { copy[i] = { role: 'assistant', content: data.answer }; break; }
          }
          return copy;
        });
      }
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: 'Error generating response.' }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    if (!sessionId) return;
    await axios.delete(`${API_BASE}/api/session/${sessionId}`);
    const { data } = await axios.post(`${API_BASE}/api/session`);
    setSessionId(data.sessionId);
    setMessages([]);
    setSources([]);
  }

  return (
    <div className="chat-container">
      <div className="top-row">
        <h3>News RAG Chatbot</h3>
        <div>
          <button onClick={handleReset}>Reset Session</button>
        </div>
      </div>
      <div className="messages">
        {messages.map((m, idx) => (
          <div key={idx} className={`message ${m.role}`}>{m.content}</div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {sources.length > 0 && (
        <div className="sources">
          Sources: {sources.map((s, i) => (
            <a key={i} href={s.url} target="_blank" rel="noreferrer">[{i+1}] {s.title || 'link'}</a>
          ))}
        </div>
      )}
      <div className="input-row">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={loading ? 'Waiting for response...' : 'Ask about the news...'} disabled={loading} onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }} />
        <button onClick={handleSend} disabled={loading || !input.trim()}>Send</button>
      </div>
    </div>
  );
}

export default App;

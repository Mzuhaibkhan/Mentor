import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const WelcomeMessage = () => (
  <div className="welcome-card">
    <div className="welcome-icon">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="url(#grad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa"/>
            <stop offset="100%" stopColor="#a78bfa"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
    <h2 className="welcome-title">AlgoMentor AI</h2>
    <p className="welcome-subtitle">Your Elite C++ & Algorithms Interview Coach</p>
    <div className="welcome-features">
      <div className="feature-item">
        <span className="feature-icon">⚡</span>
        <div>
          <strong>Strict Mentorship</strong>
          <p>Only algorithms, C++, and data structures. No hand-holding.</p>
        </div>
      </div>
      <div className="feature-item">
        <span className="feature-icon">🎯</span>
        <div>
          <strong>Big-O Analysis</strong>
          <p>Deep focus on time and space complexity for every solution.</p>
        </div>
      </div>
      <div className="feature-item">
        <span className="feature-icon">🔍</span>
        <div>
          <strong>Code Review</strong>
          <p>Paste your C++ code on the left, then ask for hints and analysis.</p>
        </div>
      </div>
      <div className="feature-item">
        <span className="feature-icon">🧠</span>
        <div>
          <strong>Strategic Hints</strong>
          <p>Guidance instead of full answers — you build the mastery.</p>
        </div>
      </div>
    </div>
    <p className="welcome-prompt">Type a question below or paste your code to get started →</p>
  </div>
);

const MarkdownMessage = ({ content }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      code({ node, inline, className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || '');
        return !inline && match ? (
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={match[1]}
            PreTag="div"
            customStyle={{
              borderRadius: '10px',
              fontSize: '13px',
              margin: '10px 0',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        ) : (
          <code className="inline-code" {...props}>
            {children}
          </code>
        );
      },
      p: ({ children }) => <p className="md-p">{children}</p>,
      h1: ({ children }) => <h1 className="md-h1">{children}</h1>,
      h2: ({ children }) => <h2 className="md-h2">{children}</h2>,
      h3: ({ children }) => <h3 className="md-h3">{children}</h3>,
      ul: ({ children }) => <ul className="md-ul">{children}</ul>,
      ol: ({ children }) => <ol className="md-ol">{children}</ol>,
      li: ({ children }) => <li className="md-li">{children}</li>,
      strong: ({ children }) => <strong className="md-strong">{children}</strong>,
      blockquote: ({ children }) => <blockquote className="md-blockquote">{children}</blockquote>,
      table: ({ children }) => <div className="md-table-wrap"><table className="md-table">{children}</table></div>,
      th: ({ children }) => <th className="md-th">{children}</th>,
      td: ({ children }) => <td className="md-td">{children}</td>,
    }}
  >
    {content}
  </ReactMarkdown>
);

function App() {
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-3.5-flash');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);
    setMessages(prev => [...prev, { role: 'model', content: '' }]);

    try {
      const payload = { history: newMessages, current_code: code || null, model: selectedModel };
      const response = await fetch('http://localhost:8000/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.body) throw new Error('ReadableStream not supported.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let currentModelMessage = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data.trim() === ': heartbeat') continue;
            if (data.startsWith('[ERROR]')) {
              currentModelMessage += `\n\n> ⚠️ **Error:** ${data.replace('[ERROR] ', '')}`;
              setMessages(prev => {
                const last = [...prev];
                last[last.length - 1] = { role: 'model', content: currentModelMessage };
                return last;
              });
              continue;
            }
            // Unescape \\n back to real newlines (escaped in backend to keep SSE frames intact)
            const textData = data.replace(/\\n/g, '\n');
            currentModelMessage += textData;
            setMessages(prev => {
              const last = [...prev];
              last[last.length - 1] = { role: 'model', content: currentModelMessage };
              return last;
            });
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      setMessages(prev => {
        const last = [...prev];
        last[last.length - 1] = {
          role: 'model',
          content: last[last.length - 1].content + '\n\n> ⚠️ **Connection Error.** Is the backend running?',
        };
        return last;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="app-root">
      {/* Animated background orbs */}
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <div className="bg-orb orb-3" />

      <div className="app-layout">
        {/* ===== LEFT: Code Editor ===== */}
        <div className="panel code-panel">
          <div className="panel-header">
            <div className="header-left">
              <div className="traffic-dots">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
              </div>
              <span className="file-name">current_code.cpp</span>
            </div>
            <span className="badge">C++ Engine</span>
          </div>
          <div className="editor-wrapper">
            <div className="line-numbers" aria-hidden="true">
              {(code || '').split('\n').map((_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>
            <textarea
              className="code-editor"
              placeholder={'// Paste your C++ code here...\n// AlgoMentor will analyze it for:\n//  - Big O complexity\n//  - Pointer safety\n//  - Algorithmic correctness'}
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck="false"
              autoCapitalize="off"
            />
          </div>
        </div>

        {/* ===== RIGHT: Chat Panel ===== */}
        <div className="panel chat-panel">
          {/* Header */}
          <div className="panel-header chat-header">
            <div className="header-left">
              <div className="logo-dot" />
              <div>
                <h1 className="app-title">AlgoMentor AI</h1>
                <span className="app-status">
                  <span className="status-dot" />
                  Strict Mentorship Mode
                </span>
              </div>
            </div>
            <div className="model-selector-wrap">
              <select
                className="model-selector"
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                disabled={isStreaming}
                title="Select AI Model"
              >
                <optgroup label="Google Gemini">
                  <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
                </optgroup>
                <optgroup label="DeepSeek via NVIDIA NIM">
                  <option value="deepseek-chat">DeepSeek V4 Pro</option>
                </optgroup>
              </select>
              <svg className="selector-arrow" width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 3L5 7L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* Messages */}
          <div className="messages-container">
            {messages.length === 0 ? (
              <WelcomeMessage />
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`message-row ${msg.role === 'user' ? 'user-row' : 'model-row'}`}>
                  {msg.role === 'model' && (
                    <div className="avatar model-avatar">🤖</div>
                  )}
                  <div className={`bubble ${msg.role === 'user' ? 'user-bubble' : 'model-bubble'}`}>
                    {msg.role === 'user' ? (
                      <p className="user-text">{msg.content}</p>
                    ) : msg.content === '' ? (
                      <div className="typing-indicator">
                        <span /><span /><span />
                      </div>
                    ) : (
                      <MarkdownMessage content={msg.content} />
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="avatar user-avatar">👤</div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="input-area">
            <div className="input-wrapper">
              <textarea
                className="chat-input"
                placeholder="Ask AlgoMentor about your code... (Shift+Enter for newline)"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={1}
              />
              <button
                className={`send-btn ${isStreaming || !input.trim() ? 'send-btn-disabled' : ''}`}
                onClick={handleSendMessage}
                disabled={isStreaming || !input.trim()}
                title="Send message"
              >
                {isStreaming ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="6" y="6" width="12" height="12" rx="2"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                )}
              </button>
            </div>
            <p className="input-hint">AlgoMentor only discusses algorithms, data structures, and C++.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

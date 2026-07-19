import { useState, useRef, useEffect } from 'react';

function App() {
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

    // Add empty model message to be progressively updated
    setMessages(prev => [...prev, { role: 'model', content: '' }]);

    try {
      const payload = {
        history: newMessages,
        current_code: code || null
      };

      const response = await fetch('http://localhost:8000/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.body) throw new Error('ReadableStream not yet supported in this browser.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      let currentModelMessage = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        
        // chunk can contain multiple SSE messages
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data.trim() === ': heartbeat') continue;
            if (data.startsWith('[ERROR]')) {
              console.error(data);
              continue;
            }
            
            // Allow strict newlines to pass through (unescaping backend replacements if needed, but our backend yields raw)
            let textData = data;
            
            // Append to current string
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
        last[last.length - 1] = { role: 'model', content: last[last.length - 1].content + '\n\n[Connection Error]' };
        return last;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Left Panel - Code Editor */}
      <div className="flex-1 border-b md:border-b-0 md:border-r border-gray-700 flex flex-col min-h-[50vh] md:min-h-0">
        <div className="bg-gray-800 p-3 border-b border-gray-700 font-mono text-sm shadow-sm flex items-center justify-between">
          <span className="text-gray-300">current_code.cpp</span>
          <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded">C++ Engine</span>
        </div>
        <textarea
          className="flex-1 bg-gray-900 text-gray-300 font-mono p-4 resize-none focus:outline-none"
          placeholder="// Write your C++ algorithms here..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck="false"
        />
      </div>

      {/* Right Panel - Chat Interface */}
      <div className="w-full md:w-[500px] flex flex-col bg-gray-800 flex-1 md:flex-none">
        <div className="bg-gray-800 p-4 border-b border-gray-700 shadow-sm flex items-center justify-between">
          <h2 className="font-semibold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            AlgoMentor AI
          </h2>
          <span className="text-xs bg-gray-700 px-2 py-1 rounded-full border border-gray-600 text-gray-300">Strict Mentorship</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-10">
              <p className="mb-2">System initialized.</p>
              <p className="text-sm">Ready to analyze Big O and algorithmic complexity.</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg p-3 ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-700 border border-gray-600 shadow-sm text-gray-200'
              }`}>
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {msg.content}
                </pre>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <div className="flex space-x-2">
            <textarea
              className="flex-1 bg-gray-900 border border-gray-700 text-sm rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none h-12"
              placeholder="Ask AlgoMentor about your code..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={isStreaming || !input.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

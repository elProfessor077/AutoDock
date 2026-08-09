'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

const SUGGESTION_CHIPS = [
  { label: '🔄 Switch to Alpine', prompt: 'Switch the base image to use Alpine Linux for a smaller image size' },
  { label: '🗄️ Add Redis cache', prompt: 'Add Redis as a caching layer to the docker-compose configuration' },
  { label: '🐘 Add PostgreSQL', prompt: 'Add PostgreSQL database to the docker-compose configuration' },
  { label: '🔒 Add health checks', prompt: 'Add comprehensive health check probes to the Dockerfile' },
  { label: '🏗️ Multi-stage build', prompt: 'Convert to a multi-stage Docker build for smaller production images' },
  { label: '🔌 Change port to 8080', prompt: 'Change the application port to 8080' },
  { label: '🐍 Switch to Python', prompt: 'Switch the runtime to Python with FastAPI framework' },
  { label: '📦 Use Bun runtime', prompt: 'Switch from Node.js to Bun runtime for faster execution' },
];

export default function BlueprintChat({
  isOpen,
  onClose,
  currentConfig,
  onApplyChanges,
}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'ai',
      content: '👋 **Hey!** I\'m your blueprint refinement assistant. Tell me what you\'d like to change about your Docker configuration — switch runtimes, add databases, tweak ports, or anything else.\n\nTry one of the suggestions below, or type your own request!',
      configPatch: null,
      blueprints: null,
      updatedConfig: null,
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build chat history for context (exclude welcome message)
      const chatHistory = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.role === 'user' ? m.content : m.content,
        }));

      const response = await fetch('/api/chat/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          currentConfig,
          chatHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error (${response.status})`);
      }

      const data = await response.json();

      const aiMsg = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: data.explanation || 'Changes processed.',
        configPatch: data.configPatch,
        blueprints: data.blueprints,
        updatedConfig: data.updatedConfig,
        hasChanges: data.configPatch && Object.keys(data.configPatch).length > 0,
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('[Chat]', err);
      const errorMsg = {
        id: `error-${Date.now()}`,
        role: 'ai',
        content: `❌ **Error:** ${err.message}. Please try again.`,
        configPatch: null,
        blueprints: null,
        updatedConfig: null,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, currentConfig]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleApply = (msg) => {
    if (msg.blueprints && msg.updatedConfig) {
      onApplyChanges(msg.blueprints, msg.updatedConfig);
      // Add a confirmation message
      setMessages(prev => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          role: 'ai',
          content: '✅ **Changes applied!** Your blueprint preview has been updated. Feel free to make more adjustments.',
          configPatch: null,
          blueprints: null,
          updatedConfig: null,
        }
      ]);
    }
  };

  // Simple markdown-ish rendering for bold and inline code
  const renderMarkdown = (text) => {
    if (!text) return '';
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && <div className="chat-backdrop" onClick={onClose} />}

      {/* Drawer */}
      <div className={`chat-drawer ${isOpen ? 'chat-drawer-open' : ''}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-header-icon">✨</div>
            <div>
              <h3 className="chat-header-title">AI Refinement Chat</h3>
              <p className="chat-header-subtitle">Modify blueprints with natural language</p>
            </div>
          </div>
          <button className="chat-close-btn" onClick={onClose} aria-label="Close chat">
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message chat-message-${msg.role}`}>
              <div className="chat-message-avatar">
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="chat-message-body">
                <div
                  className="chat-message-content"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                />

                {/* Config patch summary */}
                {msg.hasChanges && msg.configPatch && (
                  <div className="chat-patch-summary">
                    <div className="chat-patch-label">📋 Config Changes:</div>
                    {Object.entries(msg.configPatch).map(([key, value]) => (
                      <div key={key} className="chat-patch-item">
                        <span className="chat-patch-key">{key}</span>
                        <span className="chat-patch-arrow">→</span>
                        <span className="chat-patch-value">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Apply button */}
                {msg.hasChanges && msg.blueprints && (
                  <button
                    className="chat-apply-btn"
                    onClick={() => handleApply(msg)}
                  >
                    🚀 Apply Changes to Blueprint
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="chat-message chat-message-ai">
              <div className="chat-message-avatar">🤖</div>
              <div className="chat-message-body">
                <div className="chat-typing-indicator">
                  <span className="chat-typing-dot" />
                  <span className="chat-typing-dot" />
                  <span className="chat-typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion chips */}
        {messages.length <= 2 && !isLoading && (
          <div className="chat-suggestions">
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip.label}
                className="chat-suggestion-chip"
                onClick={() => sendMessage(chip.prompt)}
                disabled={isLoading}
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div className="chat-input-bar">
          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            placeholder="e.g. 'Add Redis cache' or 'Switch to Python'..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            className="chat-send-btn"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
          >
            {isLoading ? '⏳' : '➤'}
          </button>
        </div>
      </div>
    </>
  );
}

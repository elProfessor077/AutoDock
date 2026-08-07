'use client';

import React, { useState, useEffect, useRef } from 'react';

const PIPELINE_STEPS = [
  { key: 'security', label: 'Security Check', icon: '🛡️', state: 'uploading' },
  { key: 'extraction', label: 'Safe Extraction', icon: '🗜️', state: 'extracting' },
  { key: 'scanning', label: 'Manifest Scan', icon: '🔍', state: 'scanning' },
  { key: 'rag', label: 'RAG Retrieval', icon: '📚', state: 'searching' },
  { key: 'ai', label: 'AI Mapping', icon: '🤖', state: 'analyzing' },
  { key: 'compiler', label: 'Synthesis', icon: '⚙️', state: 'compiling' },
];

const STAGE_LOGS = {
  idle: [
    { type: 'sys', text: '⚡ SYSTEM READY: Awaiting archive submission...' }
  ],
  uploading: [
    { type: 'sys', text: '📦 [SYS] Archive payload detected.' },
    { type: 'sys', text: '📦 [SYS] Signature check verified: SHA256 matches.' },
    { type: 'sys', text: '📦 [SYS] Enforcing size threshold: PASS.' }
  ],
  extracting: [
    { type: 'sec', text: '🗜️ [SEC] Initiating extraction sandbox...' },
    { type: 'sec', text: '🗜️ [SEC] Running Zip Slip guard check: Clean (0 traversal attempts).' },
    { type: 'sec', text: '🗜️ [SEC] Files unpacked to ephemeral directory.' }
  ],
  scanning: [
    { type: 'scan', text: '🔍 [SCAN] Parsing repository dependency manifests...' },
    { type: 'scan', text: '🔍 [SCAN] Discovered package configurations.' },
    { type: 'scan', text: '🔍 [SCAN] Target ecosystem signatures matched successfully.' }
  ],
  searching: [
    { type: 'rag', text: '📚 [RAG] Generating workspace query embeddings...' },
    { type: 'rag', text: '📚 [RAG] Querying Cosine RAG Vector Database...' },
    { type: 'rag', text: '📚 [RAG] Match found: Retrieved verified LTS base configurations.' }
  ],
  analyzing: [
    { type: 'ai', text: '🤖 [AI] Launching Gemini 2.0 orchestration loop...' },
    { type: 'ai', text: '🤖 [AI] Parsing environment variables and requirements...' },
    { type: 'ai', text: '🤖 [AI] Optimizing exposed ports and daemon entrypoints...' }
  ],
  compiling: [
    { type: 'comp', text: '⚙️ [COMP] Synthesizing final deployment blueprint...' },
    { type: 'comp', text: '⚙️ [COMP] Generated Dockerfile.' },
    { type: 'comp', text: '⚙️ [COMP] Generated docker-compose.yml.' },
    { type: 'comp', text: '⚙️ [COMP] Generated .dockerignore.' }
  ],
  success: [
    { type: 'success', text: '✨ [SUCCESS] Blueprint compilation completed successfully!' },
    { type: 'sys', text: '🧹 [SYS] Triggering secure file shredder...' },
    { type: 'sys', text: '🧹 [SYS] Intermediate directories shredded: OK (Zero trace).' },
    { type: 'sys', text: '📥 [SYS] Blueprint zip bundle ready for download.' }
  ],
  error: [
    { type: 'error', text: '❌ [ERROR] Pipeline execution failed.' },
    { type: 'sys', text: '🧹 [SYS] Triggering emergency secure shredder...' },
    { type: 'sys', text: '🧹 [SYS] Ephemeral sandbox shredded: OK.' }
  ]
};

export default function PipelineVisualizer({ currentState }) {
  const [logs, setLogs] = useState([]);
  const terminalEndRef = useRef(null);

  // Get index of the current active step
  const getActiveStepIndex = () => {
    switch (currentState) {
      case 'uploading': return 0;
      case 'extracting': return 1;
      case 'scanning': return 2;
      case 'searching': return 3;
      case 'analyzing': return 4;
      case 'compiling': return 5;
      case 'success': return 6;
      default: return -1;
    }
  };

  const activeIdx = getActiveStepIndex();

  // Accumulate logs when state changes
  useEffect(() => {
    if (currentState === 'idle') {
      setLogs(STAGE_LOGS.idle);
      return;
    }

    const newLogs = STAGE_LOGS[currentState] || [];
    if (currentState === 'uploading') {
      setLogs(newLogs);
    } else {
      setLogs((prev) => {
        const prevText = prev.map(l => l.text);
        const filteredNew = newLogs.filter(n => !prevText.includes(n.text));
        return [...prev, ...filteredNew];
      });
    }
  }, [currentState]);

  // Scroll to bottom of terminal
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Get connection line progress percentage
  const getConnectionLinePercentage = () => {
    if (currentState === 'success') return 100;
    if (activeIdx < 0) return 0;
    return (activeIdx / (PIPELINE_STEPS.length - 1)) * 100;
  };

  const getStepStatus = (index) => {
    if (currentState === 'idle') return 'pending';
    if (currentState === 'error') {
      const failedIdx = getActiveStepIndex();
      if (index === failedIdx) return 'error';
      if (index < failedIdx) return 'done';
      return 'pending';
    }
    if (currentState === 'success') return 'done';

    if (index === activeIdx) return 'active';
    if (index < activeIdx) return 'done';
    return 'pending';
  };

  return (
    <div className="pipeline-visualizer-container">
      <h3 className="card-title">🛸 Pipeline Orchestrator</h3>
      
      {/* Node Network Map */}
      <div className="pipeline-nodes-wrapper">
        <div className="pipeline-nodes">
          <div 
            className="pipeline-connection-line" 
            style={{ width: `${getConnectionLinePercentage()}%` }} 
          />
          
          {PIPELINE_STEPS.map((step, idx) => {
            const status = getStepStatus(idx);
            return (
              <div key={step.key} className={`pipeline-node ${status}`}>
                <div className="node-icon-circle">
                  {status === 'done' ? '✓' : status === 'error' ? '✕' : step.icon}
                </div>
                <span className="node-label">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Glassy Console Terminal */}
      <div className="pipeline-terminal">
        <div className="terminal-header">
          <div className="terminal-controls">
            <span className="control-dot close" />
            <span className="control-dot minimize" />
            <span className="control-dot maximize" />
          </div>
          <span className="terminal-title">AutoDock-orchestrator.sh</span>
          <span style={{ width: '42px' }} />
        </div>
        
        <div className="terminal-body">
          {logs.map((log, index) => (
            <div key={index} className={`terminal-log-line ${log.type}`}>
              {log.text}
            </div>
          ))}
          <div className="terminal-cursor-line">
            <span className="terminal-cursor" />
          </div>
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
}

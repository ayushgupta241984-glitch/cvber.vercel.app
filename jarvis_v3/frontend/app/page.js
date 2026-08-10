'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const WS_URL =
  (typeof window !== 'undefined' &&
    `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`) ||
  'ws://localhost:8001/ws';

export default function Home() {
  const canvasRef = useRef(null);
  const ringCanvasRef = useRef(null);
  const wsRef = useRef(null);
  const chatRef = useRef(null);
  const recognitionRef = useRef(null);
  const pendingRef = useRef(false);
  const timeRef = useRef('00:00:00');
  const pulseRef = useRef(0);
  const stateRef = useRef('standby');
  const speakingRef = useRef(false);
  const ttsActiveRef = useRef(false);

  const [state, setState] = useState('standby');
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [micMuted, setMicMuted] = useState(false);
  const micMutedRef = useRef(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => { stateRef.current = state; }, [state]);

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const fillPending = useCallback((text) => {
    setMessages((prev) => prev.map((m) => (m.pending ? { ...m, text, pending: false } : m)));
  }, []);

  const speak = useCallback((text) => {
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    ttsActiveRef.current = true;
    speakingRef.current = true;
    try { recognitionRef.current?.stop(); } catch {}
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 1.0;
    const done = () => {
      speakingRef.current = false;
      ttsActiveRef.current = false;
      if (!micMutedRef.current) {
        setTimeout(() => { try { micStartRef.current?.(); } catch {} }, 2000);
      }
    };
    u.onend = done;
    u.onerror = done;
    window.speechSynthesis.speak(u);
  }, []);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (data.type === 'state_update') {
          const s = data.data?.state || data.data;
          if (typeof s === 'string') setState(s);
        } else if (data.type === 'response') {
          pendingRef.current = false;
          fillPending(data.data);
          speak(data.data);
        }
      } catch {}
    };
    fetch('/api/status')
      .then((r) => r.json())
      .then((d) => { if (d.state) setState(d.state); })
      .catch(() => {});
    return () => ws.close();
  }, [fillPending, speak]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const micStartRef = useRef(null);

  useEffect(() => {
    const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) return;
    let stopped = false;

    const start = () => {
      if (stopped || micMutedRef.current || ttsActiveRef.current) return;
      try {
        const rec = new SR();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';
        rec.onresult = (e) => {
          let finalText = '';
          let interimText = '';
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const t = e.results[i][0].transcript;
            if (e.results[i].isFinal) finalText += t;
            else interimText += t;
          }
          setTranscript(interimText || finalText);
          if (finalText.trim()) {
            sendCommand(finalText.trim());
            setTranscript('');
          }
        };
        rec.onerror = () => {
          if (!stopped && !ttsActiveRef.current) setTimeout(start, 800);
        };
        rec.onend = () => {
          if (!stopped && !ttsActiveRef.current) setTimeout(start, 500);
        };
        rec.start();
        recognitionRef.current = rec;
      } catch {}
    };
    micStartRef.current = start;

    start();
    return () => {
      stopped = true;
      try { recognitionRef.current?.stop(); } catch {}
    };
  }, []);

  const sendCommand = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setInput('');
    setState('thinking');
    pendingRef.current = true;
    speakingRef.current = true;
    addMessage({ role: 'user', text: trimmed });
    addMessage({ role: 'jarvis', text: '', pending: true });
    const timeoutId = setTimeout(() => {
      if (pendingRef.current) {
        pendingRef.current = false;
        speakingRef.current = false;
        fillPending('Taking longer than expected. The AI model may be busy.');
        setState('standby');
      }
    }, 35000);
    try {
      const res = await fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed, no_tts: true }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      clearTimeout(timeoutId);
      pendingRef.current = false;
      speakingRef.current = false;
      fillPending(`Backend error: ${err.message}`);
      setState('standby');
    }
  }, [addMessage, fillPending]);

  const toggleMute = useCallback(() => {
    setMicMuted((prev) => {
      micMutedRef.current = !prev;
      if (!prev) {
        try { recognitionRef.current?.stop(); } catch {}
      } else if (!ttsActiveRef.current) {
        setTimeout(() => { try { micStartRef.current?.(); } catch {} }, 100);
      }
      return !prev;
    });
  }, []);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    const N = 8000;
    const phi = [], theta = [], sz = [], br = [];
    for (let i = 0; i < N; i++) {
      phi.push(Math.acos(2 * Math.random() - 1));
      theta.push(2 * Math.PI * Math.random());
      sz.push(0.5 + Math.random() * 1.5);
      br.push(0.3 + Math.random() * 0.7);
    }
    let rotY = 0;
    const resize = () => {
      c.width = c.getBoundingClientRect().width * devicePixelRatio;
      c.height = c.getBoundingClientRect().height * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);
    let raf;
    const draw = () => {
      const w = c.width, h = c.height;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const R = Math.min(w, h) * 0.38;
      const pTarget = stateRef.current === 'thinking' ? 0.15 : stateRef.current === 'listening' ? 0.08 : 0;
      pulseRef.current += (pTarget - pulseRef.current) * 0.05;
      const aR = R * (1 + pulseRef.current);
      rotY += 0.003;
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const proj = [];
      for (let i = 0; i < N; i++) {
        const r2 = aR * (0.92 + 0.08 * Math.sin(phi[i] * 3 + rotY * 2));
        const x3 = r2 * Math.sin(phi[i]) * Math.cos(theta[i]);
        const y3 = r2 * Math.sin(phi[i]) * Math.sin(theta[i]);
        const z3 = r2 * Math.cos(phi[i]);
        const xr = x3 * cosY - z3 * sinY, zr = x3 * sinY + z3 * cosY;
        const sc = 280 / (280 + zr);
        proj.push({ sx: cx + xr * sc, sy: cy + y3 * sc, d: (zr + aR) / (2 * aR), s: sz[i] * sc, b: br[i] });
      }
      proj.sort((a, b) => a.d - b.d);
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, aR * 1.6);
      glow.addColorStop(0, 'rgba(0,140,255,0.12)');
      glow.addColorStop(0.5, 'rgba(0,180,255,0.04)');
      glow.addColorStop(1, 'rgba(0,200,255,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
      for (const p of proj) {
        const a = (0.15 + p.d * 0.85) * p.b;
        ctx.fillStyle = `rgba(0,${140 + (p.b * 115) | 0},255,${a})`;
        ctx.fillRect(p.sx - p.s / 2, p.sy - p.s / 2, p.s, p.s);
      }
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, aR * 0.4);
      core.addColorStop(0, 'rgba(0,200,255,0.25)');
      core.addColorStop(0.6, 'rgba(0,150,255,0.08)');
      core.addColorStop(1, 'rgba(0,100,255,0)');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, aR * 0.4, 0, Math.PI * 2);
      ctx.fill();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    const c = ringCanvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    let frame = 0;
    const resize = () => {
      c.width = c.getBoundingClientRect().width * devicePixelRatio;
      c.height = c.getBoundingClientRect().height * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);
    let raf;
    const draw = () => {
      const w = c.width, h = c.height;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const R = Math.min(w, h) * 0.44;
      ctx.strokeStyle = 'rgba(0,180,255,0.15)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, R * (0.95 + i * 0.02), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(0,180,255,0.1)';
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * R * 0.8, cy + Math.sin(a) * R * 0.8);
        ctx.lineTo(cx + Math.cos(a) * R * 1.2, cy + Math.sin(a) * R * 1.2);
        ctx.stroke();
      }
      const t = frame * 0.01;
      ctx.strokeStyle = 'rgba(255,140,0,0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.02, t, t + 0.8);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(0,200,255,0.25)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.02, t + Math.PI, t + Math.PI + 1.2);
      ctx.stroke();
      const labels = [
        { text: 'SYS CORE', a: -Math.PI / 2 - 0.15, r: 1.08 },
        { text: '0.887759', a: -0.3, r: 1.06 },
        { text: 'STANDBY 03:2', a: -Math.PI * 0.15, r: 1.12 },
        { text: '1/10', a: 0, r: 1.22 },
        { text: '0x7B', a: Math.PI * 0.25, r: 1.18 },
        { text: '2245.2', a: Math.PI * 0.72, r: 1.1 },
        { text: 'NET: OK', a: Math.PI * 0.85, r: 1.06 },
        { text: '0.411', a: Math.PI * 1.15, r: 1.12 },
        { text: 'SYNC', a: -Math.PI * 0.65, r: 1.1 },
        { text: '1149', a: Math.PI * 0.55, r: 1.15 },
        { text: '0x19', a: Math.PI * 0.38, r: 1.2 },
        { text: 'MOD: 3', a: -Math.PI * 0.45, r: 1.18 },
      ];
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(0,200,255,0.4)';
      ctx.textAlign = 'center';
      labels.forEach((l) => {
        ctx.fillText(l.text, cx + Math.cos(l.a) * l.r * R, cy + Math.sin(l.a) * l.r * R);
      });
      frame++;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const el = document.getElementById('jarvis-clock');
      if (el) el.textContent = new Date().toTimeString().slice(0, 8);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#04080f', overflow: 'hidden', fontFamily: '"JetBrains Mono", monospace' }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(0,100,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,100,255,0.04) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, zIndex: 10, borderBottom: '1px solid rgba(0,180,255,0.08)' }}>
        <span style={{ fontSize: 11, letterSpacing: 6, color: '#00c8ff', fontWeight: 600 }}>J · A · R · V · I · S</span>
        <span style={{ fontSize: 9, color: 'rgba(0,200,255,0.35)', letterSpacing: 2 }}>NEURAL OPERATING SYSTEM</span>
        <span style={{ fontSize: 9, color: 'rgba(0,200,255,0.35)', letterSpacing: 2 }}>v9.4.1</span>
        <span style={{ fontSize: 9, color: 'rgba(0,200,255,0.35)', letterSpacing: 2 }}>0xF77A1</span>
        <span style={{ fontSize: 9, color: '#00ff88', letterSpacing: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: connected ? '#00ff88' : '#ff4444', display: 'inline-block' }} />
          STATUS {connected ? 'ONLINE' : 'OFFLINE'}
        </span>
      </div>

      <canvas ref={ringCanvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }} />
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }} />

      {transcript && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, 80px)',
          padding: '6px 18px', borderRadius: 4,
          background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,200,255,0.2)',
          color: 'rgba(0,200,255,0.7)', fontSize: 11, letterSpacing: 1, zIndex: 5,
        }}>
          {transcript}
        </div>
      )}

      <div style={{ position: 'absolute', bottom: 50, left: '50%', transform: 'translateX(-50%)', width: '80%', maxWidth: 700, zIndex: 10 }}>
        <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 8, padding: '0 10px' }} ref={chatRef}>
          {messages.map((m, i) =>
            m.role === 'user' ? (
              <div key={i} style={{ textAlign: 'right', marginBottom: 4 }}>
                <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 4, background: 'rgba(0,100,255,0.12)', border: '1px solid rgba(0,150,255,0.15)', color: '#7dc8ff', fontSize: 11, letterSpacing: 0.5 }}>
                  {m.text}
                </span>
              </div>
            ) : (
              <div key={i} style={{ textAlign: 'left', marginBottom: 4 }}>
                <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 4, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,180,255,0.15)', color: '#b0e0ff', fontSize: 11, letterSpacing: 0.5 }}>
                  {m.pending ? <span style={{ opacity: 0.5 }}>...</span> : m.text}
                </span>
              </div>
            )
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={toggleMute}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              border: `1.5px solid ${micMuted ? 'rgba(255,68,68,0.4)' : 'rgba(0,255,136,0.4)'}`,
              background: micMuted ? 'rgba(255,68,68,0.1)' : 'rgba(0,255,136,0.12)',
              color: micMuted ? '#ff4444' : '#00ff88', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: micMuted ? 'none' : '0 0 12px rgba(0,255,136,0.3)',
              transition: 'all 0.2s', flexShrink: 0,
            }}
            title={micMuted ? 'Unmute mic' : 'Mute mic'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
              {micMuted ? (
                <>
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                  <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .28-.02.56-.05.83" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </>
              ) : (
                <>
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </>
              )}
            </svg>
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendCommand(input)}
            placeholder="Speak or type a command..."
            style={{
              flex: 1, height: 36, padding: '0 14px', borderRadius: 4,
              border: '1px solid rgba(0,180,255,0.2)', background: 'rgba(0,0,0,0.5)',
              color: '#e2e8f0', fontSize: 12, outline: 'none', fontFamily: '"JetBrains Mono", monospace',
            }}
          />
          <button
            onClick={() => sendCommand(input)}
            disabled={!input.trim()}
            style={{
              width: 36, height: 36, borderRadius: 4, flexShrink: 0,
              border: '1px solid rgba(0,180,255,0.3)',
              background: input.trim() ? 'rgba(0,180,255,0.12)' : 'rgba(0,0,0,0.3)',
              color: input.trim() ? '#00c8ff' : 'rgba(0,180,255,0.3)',
              cursor: input.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
              <path d="m21.854 2.147-10.94 10.939" />
            </svg>
          </button>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, zIndex: 10, borderTop: '1px solid rgba(0,180,255,0.08)' }}>
        {[
          { label: 'CORE STABLE', ok: true },
          { label: 'ENCRYPTION AES-512', ok: true },
          { label: micMuted ? 'NEURAL LINK MUTED' : 'NEURAL LINK ACTIVE', ok: !micMuted },
          { label: 'PROTOCOL // SENTINEL', ok: true },
          { label: state === 'standby' ? 'ALL SYSTEMS NORMAL' : `STATUS: ${state.toUpperCase()}`, ok: true },
        ].map((s, i) => (
          <span key={i} style={{ fontSize: 8, letterSpacing: 2, color: s.ok ? 'rgba(0,200,255,0.35)' : '#ff4444' }}>
            {s.label}
          </span>
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: 42, right: 20, zIndex: 10 }}>
        <span id="jarvis-clock" style={{ fontSize: 9, color: 'rgba(0,200,255,0.3)', letterSpacing: 2 }}>
          00:00:00
        </span>
      </div>
    </div>
  );
}

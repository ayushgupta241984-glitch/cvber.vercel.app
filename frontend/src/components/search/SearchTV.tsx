'use client';

import { X, Search, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

interface SearchTVProps {
  fileBlob?: Blob;
  fileName?: string;
}

interface LogEntry {
  id: number;
  type: 'describe' | 'query' | 'checking' | 'match' | 'reject' | 'info';
  text: string;
  score?: number;
  imageUrl?: string;
}

export function SearchTV({ fileBlob, fileName }: SearchTVProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [matches, setMatches] = useState<{ url: string; similarity: number; id: number }[]>([]);
  const [counters, setCounters] = useState({ searched: 0, compared: 0, found: 0 });
  const [elapsed, setElapsed] = useState(0);
  const logEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<(() => void) | null>(null);
  const matchIdRef = useRef(0);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Timer
  useEffect(() => {
    if (!isOpen) return;
    setElapsed(0);
    const interval = setInterval(() => setElapsed(t => t + 0.1), 100);
    return () => clearInterval(interval);
  }, [isOpen]);

  const addLog = useCallback((entry: LogEntry) => {
    setLogs(prev => [...prev.slice(-200), entry]);
  }, []);

  const handleEvent = useCallback((event: string, data: any) => {
    const ts = Date.now() + Math.random();

    switch (event) {
      case 'describe':
        addLog({ id: ts, type: 'describe', text: '🤖 AI analyzing image with NVIDIA Gemma...' });
        break;
      case 'describe_done':
        addLog({ id: ts, type: 'describe', text: `   → "${(data.description || '').slice(0, 120)}"` });
        addLog({ id: ts + 1, type: 'info', text: '────────────────────────' });
        break;
      case 'thinking':
        addLog({ id: ts, type: 'info', text: '🧠 Generating search queries...' });
        break;
      case 'query':
        addLog({ id: ts, type: 'query', text: `🔍 Searching Bing: "${data.query}"` });
        break;
      case 'query_results':
        addLog({ id: ts, type: 'info', text: `   ✓ Found ${data.count || 0} new images (${data.total || 0} total)` });
        setCounters(prev => ({ ...prev, searched: prev.searched + (data.count || 0) }));
        break;
      case 'query_empty':
        addLog({ id: ts, type: 'info', text: `   No results for this query` });
        break;
      case 'checking': {
        const idx = data.index || 0;
        const total = data.total || 0;
        const pct = Math.round((idx / Math.max(total, 1)) * 100);
        const bar = '█'.repeat(Math.floor(pct / 20)) + '░'.repeat(5 - Math.floor(pct / 20));
        addLog({ id: ts, type: 'checking', text: `   Checking ${idx}/${total}... ${bar} ${pct}%`, imageUrl: data.url });
        break;
      }
      case 'match': {
        matchIdRef.current++;
        const mid = matchIdRef.current;
        addLog({ id: ts, type: 'match', text: `   ✓ MATCH  ${data.similarity}% — similar composition`, score: data.similarity, imageUrl: data.url });
        setMatches(prev => [...prev, { url: data.url, similarity: data.similarity, id: mid }]);
        setCounters(prev => ({ ...prev, found: prev.found + 1, compared: prev.compared + 1 }));
        break;
      }
      case 'reject': {
        const reason = data.reason || `Only ${data.similarity}%`;
        addLog({ id: ts, type: 'reject', text: `   ✗ REJECTED  ${data.similarity}% — ${reason}`, imageUrl: data.url, score: data.similarity });
        setCounters(prev => ({ ...prev, compared: prev.compared + 1 }));
        break;
      }
      case 'progress':
        // counters already tracked per-event
        break;
      case 'done': {
        addLog({ id: ts, type: 'info', text: '────────────────────────' });
        addLog({ id: ts + 1, type: 'info', text: `✅ SEARCH COMPLETE  |  ${data.images_searched || 0} images · ${data.total_found || 0} matches · ${elapsed.toFixed(1)}s` });
        break;
      }
      case 'error':
        addLog({ id: ts, type: 'info', text: `❌ ${data.message || 'Unknown error'}` });
        break;
    }
  }, [addLog, elapsed]);

  const handleError = useCallback((err: string) => {
    addLog({ id: Date.now(), type: 'info', text: `❌ Error: ${err}` });
  }, [addLog]);

  const handleDone = useCallback(() => {
    // Done event already logged
  }, []);

  const startSearch = useCallback(() => {
    if (!fileBlob || !fileName) return;
    setLogs([]);
    setMatches([]);
    setCounters({ searched: 0, compared: 0, found: 0 });
    matchIdRef.current = 0;

    addLog({ id: Date.now(), type: 'info', text: '▶ SEARCH TV INITIALIZED' });
    addLog({ id: Date.now() + 0.5, type: 'info', text: `   File: ${fileName}` });
    addLog({ id: Date.now() + 1, type: 'info', text: '────────────────────────' });

    const file = new File([fileBlob], fileName, { type: fileBlob.type || 'image/jpeg' });
    const { abort } = apiClient.deepImageSearchTV(file, handleEvent, handleError, handleDone);
    abortRef.current = abort;
  }, [fileBlob, fileName, addLog, handleEvent, handleError, handleDone]);

  const close = useCallback(() => {
    abortRef.current?.();
    setIsOpen(false);
  }, []);

  // Start search when opened — must be before early return (hooks order)
  useEffect(() => {
    if (isOpen) {
      startSearch();
    }
    return () => {
      abortRef.current?.();
    };
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        disabled={!fileBlob}
        className="flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-wider border border-luxury-gold/40 text-luxury-gold hover:bg-luxury-gold/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Search className="w-3 h-3" />
        Search TV
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-luxury-steel/30 bg-black/95">
        <div className="flex items-center gap-4">
          <span className="text-xs text-luxury-gold font-mono tracking-widest">◉ SEARCH TV</span>
          <span className="text-[9px] text-luxury-muted/40 uppercase tracking-wider">Scanning the web for copies</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-xs text-luxury-muted/60 font-mono tabular-nums">{elapsed.toFixed(1)}s</span>
          <button onClick={close} className="p-1.5 text-luxury-muted/40 hover:text-luxury-cream transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* LEFT: Live Feed */}
        <div className="flex-[2] overflow-y-auto border-r border-luxury-steel/20 bg-[#0a0a0a]">
          <div className="p-4 font-mono text-xs leading-relaxed space-y-0.5">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 py-0.5">
                {log.imageUrl ? (
                  <div className="flex items-center gap-2 min-w-0 w-full">
                    <img
                      src={log.imageUrl}
                      alt=""
                      className="w-8 h-8 object-cover rounded shrink-0 border border-luxury-steel/30"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div className="min-w-0 flex-1">
                      <span className={
                        log.type === 'match' ? 'text-emerald-400/90' :
                        log.type === 'reject' ? 'text-red-400/60' :
                        'text-luxury-muted/60'
                      }>
                        {log.text}
                      </span>
                    </div>
                    {log.score && (
                      <span className={`shrink-0 text-[10px] font-bold ${
                        log.score >= 70 ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {log.score}%
                      </span>
                    )}
                  </div>
                ) : (
                  <span className={
                    log.type === 'describe' ? 'text-cyan-400/80' :
                    log.type === 'query' ? 'text-luxury-gold/80' :
                    log.type === 'match' ? 'text-emerald-400' :
                    log.type === 'reject' ? 'text-red-400/60' :
                    'text-luxury-muted/50'
                  }>
                    {log.text}
                  </span>
                )}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>

        {/* RIGHT: Matches Panel */}
        <div className="flex-1 overflow-y-auto bg-black/80">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] text-luxury-muted/50 uppercase tracking-wider">Matches</span>
              <span className="text-[10px] text-luxury-gold/60 font-mono">{matches.length}</span>
            </div>
            <AnimatePresence>
              <div className="space-y-2">
                {matches.map((m) => (
                  <motion.a
                    key={m.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 p-2 border border-luxury-steel/20 hover:border-emerald-500/40 transition-all"
                  >
                    <img src={m.url} alt="" className="w-12 h-12 object-cover rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <div className="flex-1 min-w-0">
                      <div className="h-1.5 bg-luxury-steel/20 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500/70 rounded-full transition-all" style={{ width: `${m.similarity}%` }} />
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400/80 font-bold">{m.similarity}%</span>
                    <ExternalLink className="w-3 h-3 text-luxury-muted/30 group-hover:text-luxury-gold/60 transition-colors shrink-0" />
                  </motion.a>
                ))}
              </div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-luxury-steel/20 bg-black/95 text-[10px] text-luxury-muted/50 font-mono">
        <div className="flex gap-6">
          <span>Searched: <span className="text-luxury-muted/70">{counters.searched}</span></span>
          <span>Compared: <span className="text-luxury-muted/70">{counters.compared}</span></span>
          <span>Found: <span className="text-emerald-400/80">{counters.found}</span></span>
        </div>
        <span className="tabular-nums">{elapsed.toFixed(1)}s</span>
      </div>
    </div>
  );
}

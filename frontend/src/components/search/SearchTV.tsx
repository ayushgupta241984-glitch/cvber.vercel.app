'use client';

import { X, Search, ExternalLink, Globe, Target, Hash, Activity, Square } from 'lucide-react';
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
  title?: string;
  source?: string;
}

export function SearchTV({ fileBlob, fileName }: SearchTVProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [matches, setMatches] = useState<{ url: string; title: string; source: string; similarity: number; id: number }[]>([]);
  const [counters, setCounters] = useState({ searched: 0, compared: 0, found: 0 });
  const [elapsed, setElapsed] = useState(0);
  const [disconnected, setDisconnected] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<(() => void) | null>(null);
  const matchIdRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (!isOpen) return;
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed(t => t + 0.1), 100);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isOpen]);

  const addLog = useCallback((entry: LogEntry) => {
    setLogs(prev => [...prev.slice(-300), entry]);
  }, []);

  const handleEvent = useCallback((event: string, data: any) => {
    setDisconnected(false);
    const ts = Date.now() + Math.random();

    switch (event) {
      case 'describe':
        addLog({ id: ts, type: 'describe', text: 'analyzing image...' });
        break;
      case 'describe_done': {
        const desc = (data.description || '').slice(0, 120);
        addLog({ id: ts, type: 'describe', text: `"${desc}"` });
        addLog({ id: ts + 1, type: 'info', text: '────────────────────────────' });
        break;
      }
      case 'thinking':
        addLog({ id: ts, type: 'info', text: 'generating search queries...' });
        break;
      case 'query':
        addLog({ id: ts, type: 'query', text: `search: "${data.query}"` });
        break;
      case 'query_results':
        addLog({ id: ts, type: 'info', text: `  ${data.count || 0} new images (${data.total || 0} total)` });
        setCounters(prev => ({ ...prev, searched: prev.searched + (data.count || 0) }));
        break;
      case 'query_empty':
        addLog({ id: ts, type: 'info', text: '  no results' });
        break;
      case 'checking': {
        const idx = data.index || 0;
        const total = data.total || 0;
        addLog({
          id: ts, type: 'checking', text: `  ${idx}/${total}`, imageUrl: data.url,
          title: data.title || '', source: data.source || '',
        });
        break;
      }
      case 'match': {
        matchIdRef.current++;
        const mid = matchIdRef.current;
        addLog({
          id: ts, type: 'match', text: `  MATCH  ${data.similarity}%`,
          score: data.similarity, imageUrl: data.url,
          title: data.title || '', source: data.source || '',
        });
        setMatches(prev => [...prev, {
          url: data.url, title: data.title || '', source: data.source || '',
          similarity: data.similarity, id: mid,
        }]);
        setCounters(prev => ({ ...prev, found: prev.found + 1, compared: prev.compared + 1 }));
        break;
      }
      case 'reject': {
        addLog({
          id: ts, type: 'reject', text: `  REJECTED  ${data.similarity}%`, imageUrl: data.url,
          score: data.similarity, title: data.title || '', source: data.source || '',
        });
        setCounters(prev => ({ ...prev, compared: prev.compared + 1 }));
        break;
      }
      case 'progress':
        break;
      case 'done': {
        addLog({ id: ts, type: 'info', text: '────────────────────────────' });
        addLog({ id: ts + 1, type: 'info', text: `DONE  ${data.images_searched || 0} images  ${data.total_found || 0} matches  ${elapsed.toFixed(1)}s` });
        if (timerRef.current) clearInterval(timerRef.current);
        break;
      }
      case 'error':
        addLog({ id: ts, type: 'info', text: `ERROR: ${data.message || 'Unknown'}` });
        break;
    }
  }, [addLog, elapsed]);

  const handleError = useCallback((err: string) => {
    addLog({ id: Date.now(), type: 'info', text: `ERROR: ${err}` });
    setDisconnected(true);
  }, [addLog]);

  const startSearch = useCallback(() => {
    if (!fileBlob || !fileName) return;
    setLogs([]);
    setMatches([]);
    setCounters({ searched: 0, compared: 0, found: 0 });
    setDisconnected(false);
    matchIdRef.current = 0;

    addLog({ id: Date.now(), type: 'info', text: `SEARCH TV  ${fileName}` });
    addLog({ id: Date.now() + 0.5, type: 'info', text: '────────────────────────────' });

    const file = new File([fileBlob], fileName, { type: fileBlob.type || 'image/jpeg' });
    const { abort } = apiClient.deepImageSearchTV(file, handleEvent, handleError);
    abortRef.current = abort;
  }, [fileBlob, fileName, addLog, handleEvent, handleError]);

  const stopSearch = useCallback(() => {
    abortRef.current?.();
    if (timerRef.current) clearInterval(timerRef.current);
    addLog({ id: Date.now(), type: 'info', text: '────────────────────────────' });
    addLog({ id: Date.now() + 1, type: 'info', text: `ABORTED  ${counters.found} matches  ${elapsed.toFixed(1)}s` });
  }, [counters.found, elapsed, addLog]);

  const close = useCallback(() => {
    abortRef.current?.();
    if (timerRef.current) clearInterval(timerRef.current);
    setIsOpen(false);
    setDisconnected(false);
  }, []);

  useEffect(() => {
    if (isOpen) startSearch();
    return () => { abortRef.current?.(); if (timerRef.current) clearInterval(timerRef.current); };
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        disabled={!fileBlob}
        className="flex items-center gap-2 px-5 py-2.5 text-[10px] uppercase tracking-widest border border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ borderRadius: 'var(--radius)' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
        Search TV
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.03)_2px,rgba(255,255,255,0.03)_4px)]" />

      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--border)] bg-black/95">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
            <span className="text-xs font-mono tracking-widest" style={{ color: 'var(--text-tertiary)' }}>LIVE</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-mono" style={{ color: 'var(--text-quaternary)' }}>SEARCH TV</span>
          <span className="text-[9px] font-mono" style={{ color: 'var(--text-quaternary)' }}>{fileName || ''}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono tabular-nums" style={{ color: 'var(--text-quaternary)' }}>{elapsed.toFixed(1)}s</span>
          <button onClick={stopSearch} className="p-1.5 border transition-colors" style={{ color: 'var(--text-quaternary)', borderColor: 'var(--border)', borderRadius: 'var(--radius)' }} title="Stop search">
            <Square className="h-3 w-3" />
          </button>
          <button onClick={close} className="p-1.5 transition-colors" style={{ color: 'var(--text-quaternary)' }}>
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="flex-[2] overflow-y-auto border-r border-[var(--border)]" style={{ background: '#0a0a0a' }}>
          <div className="p-4 font-mono text-xs leading-relaxed space-y-0.5">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 py-0.5">
                {log.imageUrl ? (
                  <div className="flex items-center gap-2 min-w-0 w-full">
                    <img
                      src={log.imageUrl}
                      alt=""
                      className="w-7 h-7 object-cover rounded shrink-0 border border-[var(--border)]"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div className="min-w-0 flex-1">
                      <span style={{
                        color: log.type === 'match' ? 'var(--text-secondary)' :
                               log.type === 'reject' ? 'var(--text-quaternary)' :
                               'var(--text-tertiary)'
                      }}>
                        {log.text}
                      </span>
                      {(log.title || log.source) && (
                        <span className="block text-[9px] truncate mt-0.5" style={{ color: 'var(--text-quaternary)' }}>
                          {log.title || ''}{log.title && log.source ? ' — ' : ''}{log.source || ''}
                        </span>
                      )}
                    </div>
                    {log.score && (
                      <span className="shrink-0 text-[10px] font-bold" style={{
                        color: log.score >= 70 ? 'var(--text-secondary)' : 'var(--text-tertiary)'
                      }}>
                        {log.score}%
                      </span>
                    )}
                  </div>
                ) : (
                  <span style={{
                    color: log.type === 'describe' ? 'var(--text-secondary)' :
                           log.type === 'query' ? 'var(--text-tertiary)' :
                           log.type === 'match' ? 'var(--text-secondary)' :
                           log.type === 'reject' ? 'var(--text-quaternary)' :
                           'var(--text-quaternary)'
                  }}>
                    {log.text}
                  </span>
                )}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto" style={{ background: '#000' }}>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-3 h-3" style={{ color: 'var(--text-quaternary)' }} />
              <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-quaternary)' }}>Matches</span>
              <span className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>{matches.length}</span>
            </div>
            {matches.length === 0 && (
              <p className="text-[11px] font-mono" style={{ color: 'var(--text-quaternary)' }}>Awaiting matches...</p>
            )}
            <AnimatePresence>
              <div className="space-y-3">
                {matches.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="group border transition-all"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
                  >
                    <div className="p-3 space-y-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={m.url}
                          alt=""
                          className="w-12 h-12 object-cover rounded shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${m.similarity}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              className="h-full rounded-full"
                              style={{ background: 'var(--text-secondary)' }}
                            />
                          </div>
                          <span className="text-[10px] font-mono font-bold mt-1 block" style={{ color: 'var(--text-secondary)' }}>{m.similarity}% similar</span>
                        </div>
                      </div>
                      {m.title && (
                        <p className="text-[10px] truncate" style={{ color: 'var(--text-tertiary)' }}>{m.title}</p>
                      )}
                      {m.source && (
                        <a
                          href={m.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-[9px] hover:text-[var(--text-secondary)] transition-colors truncate"
                          style={{ color: 'var(--text-quaternary)' }}
                        >
                          <Globe className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{extractDomain(m.source) || m.source}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </div>

          <div className="border-t border-[var(--border)] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-3 h-3" style={{ color: 'var(--text-quaternary)' }} />
              <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-quaternary)' }}>Stats</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span style={{ color: 'var(--text-quaternary)' }}>Searched</span>
                <span className="font-mono" style={{ color: 'var(--text-tertiary)' }}>{counters.searched}</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span style={{ color: 'var(--text-quaternary)' }}>Compared</span>
                <span className="font-mono" style={{ color: 'var(--text-tertiary)' }}>{counters.compared}</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span style={{ color: 'var(--text-quaternary)' }}>Found</span>
                <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{counters.found}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-[var(--border)]">
                <span style={{ color: 'var(--text-quaternary)' }}>Elapsed</span>
                <span className="font-mono tabular-nums" style={{ color: 'var(--text-tertiary)' }}>{elapsed.toFixed(1)}s</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {disconnected && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 border" style={{ background: '#000', borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>search stream disconnected. try again.</span>
          <button onClick={startSearch} className="text-[10px] uppercase tracking-widest font-bold transition-colors" style={{ color: 'var(--text-secondary)' }}>
            Retry
          </button>
        </div>
      )}
    </div>
  );
}

function extractDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

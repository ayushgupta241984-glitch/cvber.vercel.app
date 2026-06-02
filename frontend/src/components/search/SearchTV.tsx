'use client';

import { X, Search, ExternalLink, Globe, Target, Hash, Activity } from 'lucide-react';
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
  const logEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<(() => void) | null>(null);
  const matchIdRef = useRef(0);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (!isOpen) return;
    setElapsed(0);
    const interval = setInterval(() => setElapsed(t => t + 0.1), 100);
    return () => clearInterval(interval);
  }, [isOpen]);

  const addLog = useCallback((entry: LogEntry) => {
    setLogs(prev => [...prev.slice(-300), entry]);
  }, []);

  const handleEvent = useCallback((event: string, data: any) => {
    const ts = Date.now() + Math.random();

    switch (event) {
      case 'describe':
        addLog({ id: ts, type: 'describe', text: 'AI analyzing image with NVIDIA Gemma...' });
        break;
      case 'describe_done': {
        const desc = (data.description || '').slice(0, 120);
        addLog({ id: ts, type: 'describe', text: `"${desc}"` });
        addLog({ id: ts + 1, type: 'info', text: '────────────────────────────' });
        break;
      }
      case 'thinking':
        addLog({ id: ts, type: 'info', text: 'Generating search queries...' });
        break;
      case 'query':
        addLog({ id: ts, type: 'query', text: `Bing: "${data.query}"` });
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
        const pct = Math.round((idx / Math.max(total, 1)) * 100);
        const domain = data.source ? extractDomain(data.source) : '';
        addLog({
          id: ts, type: 'checking', text: `  ${idx}/${total}`, imageUrl: data.url,
          title: data.title || '', source: domain || data.source || '',
        });
        break;
      }
      case 'match': {
        matchIdRef.current++;
        const mid = matchIdRef.current;
        const domain = data.source ? extractDomain(data.source) : '';
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
        const reason = data.reason || `${data.similarity}%`;
        const domain = data.source ? extractDomain(data.source) : '';
        addLog({
          id: ts, type: 'reject', text: `  REJECTED  ${data.similarity}%`, imageUrl: data.url,
          score: data.similarity, title: data.title || '', source: domain || '',
        });
        setCounters(prev => ({ ...prev, compared: prev.compared + 1 }));
        break;
      }
      case 'progress':
        break;
      case 'done': {
        addLog({ id: ts, type: 'info', text: '────────────────────────────' });
        addLog({ id: ts + 1, type: 'info', text: `DONE  ${data.images_searched || 0} images  ${data.total_found || 0} matches  ${elapsed.toFixed(1)}s` });
        break;
      }
      case 'error':
        addLog({ id: ts, type: 'info', text: `ERROR: ${data.message || 'Unknown'}` });
        break;
    }
  }, [addLog, elapsed]);

  const handleError = useCallback((err: string) => {
    addLog({ id: Date.now(), type: 'info', text: `ERROR: ${err}` });
  }, [addLog]);

  const startSearch = useCallback(() => {
    if (!fileBlob || !fileName) return;
    setLogs([]);
    setMatches([]);
    setCounters({ searched: 0, compared: 0, found: 0 });
    matchIdRef.current = 0;

    addLog({ id: Date.now(), type: 'info', text: `SEARCH TV  ${fileName}` });
    addLog({ id: Date.now() + 0.5, type: 'info', text: '────────────────────────────' });

    const file = new File([fileBlob], fileName, { type: fileBlob.type || 'image/jpeg' });
    const { abort } = apiClient.deepImageSearchTV(file, handleEvent, handleError);
    abortRef.current = abort;
  }, [fileBlob, fileName, addLog, handleEvent, handleError]);

  const close = useCallback(() => {
    abortRef.current?.();
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (isOpen) startSearch();
    return () => abortRef.current?.();
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        disabled={!fileBlob}
        className="group relative flex items-center gap-2 px-5 py-2.5 text-[10px] uppercase tracking-widest border border-luxury-gold/40 text-luxury-gold hover:bg-luxury-gold/10 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden"
      >
        <span className="relative z-10 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold/60 animate-pulse" />
          Search TV
        </span>
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-luxury-gold/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.03)_2px,rgba(255,255,255,0.03)_4px)]" />

      <div className="flex items-center justify-between px-6 py-3 border-b border-luxury-steel/30 bg-black/95">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-luxury-gold font-mono tracking-widest">LIVE</span>
          </div>
          <span className="text-[10px] text-luxury-muted/40 uppercase tracking-wider font-mono">SEARCH TV</span>
          <span className="text-[9px] text-luxury-muted/30 font-mono">{fileName || ''}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-luxury-muted/60 font-mono tabular-nums">{elapsed.toFixed(1)}s</span>
          <button onClick={close} className="p-1.5 text-luxury-muted/40 hover:text-luxury-cream transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="flex-[2] overflow-y-auto border-r border-luxury-steel/20 bg-[#0a0a0a]">
          <div className="p-4 font-mono text-xs leading-relaxed space-y-0.5">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 py-0.5">
                {log.imageUrl ? (
                  <div className="flex items-center gap-2 min-w-0 w-full">
                    <img
                      src={log.imageUrl}
                      alt=""
                      className="w-7 h-7 object-cover rounded shrink-0 border border-luxury-steel/30"
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
                      {(log.title || log.source) && (
                        <span className="block text-[9px] text-luxury-muted/30 truncate mt-0.5">
                          {log.title || ''}{log.title && log.source ? ' — ' : ''}{log.source || ''}
                        </span>
                      )}
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

        <div className="flex-1 overflow-y-auto bg-black/80">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-3 h-3 text-emerald-400/60" />
              <span className="text-[10px] text-luxury-muted/50 uppercase tracking-wider">Matches</span>
              <span className="text-[10px] text-emerald-400/80 font-mono">{matches.length}</span>
            </div>
            {matches.length === 0 && (
              <p className="text-[11px] text-luxury-muted/30 font-mono">Awaiting matches...</p>
            )}
            <AnimatePresence>
              <div className="space-y-3">
                {matches.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="group border border-emerald-500/20 hover:border-emerald-500/40 transition-all bg-emerald-500/5"
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
                          <div className="h-2 bg-luxury-steel/20 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${m.similarity}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              className="h-full bg-gradient-to-r from-emerald-500/60 to-emerald-400 rounded-full"
                            />
                          </div>
                          <span className="text-[10px] font-mono text-emerald-400/80 font-bold mt-1 block">{m.similarity}% similar</span>
                        </div>
                      </div>
                      {m.title && (
                        <p className="text-[10px] text-luxury-muted/60 truncate">{m.title}</p>
                      )}
                      {m.source && (
                        <a
                          href={m.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-[9px] text-luxury-muted/40 hover:text-luxury-gold/80 transition-colors truncate"
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

          <div className="border-t border-luxury-steel/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-3 h-3 text-luxury-gold/40" />
              <span className="text-[10px] text-luxury-muted/50 uppercase tracking-wider">Stats</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-luxury-muted/40">Searched</span>
                <span className="text-luxury-muted/70 font-mono">{counters.searched}</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-luxury-muted/40">Compared</span>
                <span className="text-luxury-muted/70 font-mono">{counters.compared}</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-luxury-muted/40">Found</span>
                <span className="text-emerald-400/80 font-mono">{counters.found}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-luxury-steel/20">
                <span className="text-luxury-muted/40">Elapsed</span>
                <span className="text-luxury-muted/70 font-mono tabular-nums">{elapsed.toFixed(1)}s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
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

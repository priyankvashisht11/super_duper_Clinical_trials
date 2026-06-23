import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box, Typography, InputBase, IconButton, Paper, Stack, Chip,
  CircularProgress, Button, Tooltip, Collapse, alpha, Divider,
} from '@mui/material';
import {
  Send as SendIcon, AutoAwesome as AIIcon, CheckCircle as DoneIcon,
  RadioButtonUnchecked as PendingIcon, Circle as ActiveIcon,
  Download as DownloadIcon, History as HistoryIcon,
  ExpandMore as ExpandIcon, ExpandLess as CollapseIcon,
  Science as PubMedIcon, LocalHospital as TrialIcon,
  Language as WebIcon, Analytics as AnalyticsIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import {
  type AgentTab, type PlannedStep, type AgentSession,
  createSession, listSessions, getSession, streamRun, artifactDownloadUrl,
} from '../../services/agentService';

// ── Tool icon map ─────────────────────────────────────────────────────────────

function ToolIcon({ tool, size = 14 }: { tool: string; size?: number }) {
  const sx = { fontSize: size };
  if (tool.includes('pubmed')) return <PubMedIcon sx={{ ...sx, color: '#7C3AED' }} />;
  if (tool.includes('clinical') || tool.includes('ctri')) return <TrialIcon sx={{ ...sx, color: '#059669' }} />;
  if (tool.includes('web')) return <WebIcon sx={{ ...sx, color: '#0047AB' }} />;
  if (tool.includes('edc') || tool.includes('analyz')) return <AnalyticsIcon sx={{ ...sx, color: '#D97706' }} />;
  return <AIIcon sx={{ ...sx, color: '#64748B' }} />;
}

// ── Plan display ──────────────────────────────────────────────────────────────

interface StepState {
  step: number; tool: string; query: string; reason: string;
  status: 'pending' | 'running' | 'done' | 'error';
  count?: number;
}

const PlanDisplay: React.FC<{ steps: StepState[] }> = ({ steps }) => (
  <Box sx={{ border: '1px solid #E8ECF0', borderRadius: 2, overflow: 'hidden', mb: 2 }}>
    <Box sx={{ px: 2, py: 1.25, backgroundColor: '#F8FAFC', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 1 }}>
      <AIIcon sx={{ fontSize: 13, color: '#4F46E5' }} />
      <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151' }}>Executing plan</Typography>
    </Box>
    <Stack divider={<Divider />}>
      {steps.map(s => (
        <Box key={s.step} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, px: 2, py: 1.25 }}>
          <Box sx={{ pt: 0.25, flexShrink: 0 }}>
            {s.status === 'done'
              ? <DoneIcon sx={{ fontSize: 15, color: '#22C55E' }} />
              : s.status === 'running'
              ? <CircularProgress size={13} thickness={3} sx={{ color: '#4F46E5' }} />
              : s.status === 'error'
              ? <DoneIcon sx={{ fontSize: 15, color: '#EF4444' }} />
              : <PendingIcon sx={{ fontSize: 15, color: '#CBD5E1' }} />}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
              <ToolIcon tool={s.tool} />
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: s.status === 'running' ? '#4F46E5' : s.status === 'done' ? '#16A34A' : '#64748B' }}>
                {s.tool.replace(/_/g, ' ')}
              </Typography>
              {s.status === 'done' && s.count !== undefined && (
                <Chip label={`${s.count} results`} size="small" sx={{ height: 16, fontSize: '0.62rem', fontWeight: 700, backgroundColor: '#F0FDF4', color: '#166534', border: 'none', borderRadius: 1 }} />
              )}
              {s.status === 'running' && (
                <Chip label="searching…" size="small" sx={{ height: 16, fontSize: '0.62rem', fontWeight: 700, backgroundColor: '#EEF2FF', color: '#4F46E5', border: 'none', borderRadius: 1 }} />
              )}
            </Box>
            <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {s.query}
            </Typography>
          </Box>
        </Box>
      ))}
    </Stack>
  </Box>
);

// ── Markdown renderer for synthesis ──────────────────────────────────────────

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    const trimmed = line.trim();
    if (!trimmed) { i++; continue; }

    // H2/H3
    const h = trimmed.match(/^#{1,3}\s+(.*)/);
    if (h) {
      elements.push(
        <Typography key={i} sx={{ fontWeight: 700, fontSize: '0.925rem', color: '#0F172A', mt: elements.length > 0 ? 2 : 0, mb: 0.75 }}>
          {renderInline(h[1]!)}
        </Typography>
      );
      i++; continue;
    }

    // Bullet
    const bullet = trimmed.match(/^[-*•]\s+(.*)/);
    if (bullet) {
      elements.push(
        <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 0.5 }}>
          <Box component="span" sx={{ color: '#3B82F6', fontSize: '0.4rem', mt: '11px', flexShrink: 0 }}>●</Box>
          <Typography sx={{ fontSize: '0.875rem', lineHeight: 1.8, color: '#334155' }}>{renderInline(bullet[1]!)}</Typography>
        </Box>
      );
      i++; continue;
    }

    // Numbered
    const num = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (num) {
      elements.push(
        <Box key={i} sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#3B82F6', minWidth: 18, mt: '2px' }}>{num[1]}.</Typography>
          <Typography sx={{ fontSize: '0.875rem', lineHeight: 1.8, color: '#334155' }}>{renderInline(num[2]!)}</Typography>
        </Box>
      );
      i++; continue;
    }

    // Paragraph
    elements.push(
      <Typography key={i} sx={{ fontSize: '0.9rem', lineHeight: 1.85, color: '#1E293B', mb: 1 }}>
        {renderInline(trimmed)}
      </Typography>
    );
    i++;
  }
  return elements;
}

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[\w-]+\])/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <Box key={i} component="span" sx={{ fontWeight: 700, color: '#0F172A' }}>{part.slice(2, -2)}</Box>;
    if (part.startsWith('*') && part.endsWith('*'))
      return <Box key={i} component="span" sx={{ fontStyle: 'italic' }}>{part.slice(1, -1)}</Box>;
    if (part.match(/^\[[\w-]+\]$/))
      return <Box key={i} component="sup" sx={{ fontSize: '0.65rem', color: '#3B82F6', fontWeight: 700, ml: '1px' }}>{part}</Box>;
    return part || null;
  });
}

// ── Message bubbles ───────────────────────────────────────────────────────────

const UserMessage: React.FC<{ text: string }> = ({ text }) => (
  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
    <Box sx={{
      maxWidth: '75%', backgroundColor: '#0047AB', color: '#fff',
      borderRadius: '16px 16px 4px 16px', px: 2, py: 1.25,
    }}>
      <Typography sx={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{text}</Typography>
    </Box>
  </Box>
);

interface AssistantMessageProps {
  steps: StepState[];
  synthesis: string;
  artifacts: { id: string; name: string; type: string; size?: number }[];
  streaming: boolean;
}

const AssistantMessage: React.FC<AssistantMessageProps> = ({ steps, synthesis, artifacts, streaming }) => {
  const [planCollapsed, setPlanCollapsed] = useState(false);
  const hasPlan = steps.length > 0;
  const hasSynthesis = synthesis.length > 0;

  return (
    <Box sx={{ mb: 2 }}>
      {/* Agent badge */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Box sx={{ width: 24, height: 24, borderRadius: 1.5, backgroundColor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AIIcon sx={{ fontSize: 13, color: '#4F46E5' }} />
        </Box>
        <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#4F46E5' }}>NexTrial Agent</Typography>
        {streaming && <CircularProgress size={11} thickness={3} sx={{ color: '#4F46E5' }} />}
      </Box>

      {/* Plan */}
      {hasPlan && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75, cursor: 'pointer' }} onClick={() => setPlanCollapsed(c => !c)}>
            <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>
              {planCollapsed ? 'Show search activity' : 'Hide search activity'}
            </Typography>
            {planCollapsed ? <ExpandIcon sx={{ fontSize: 13, color: '#94A3B8' }} /> : <CollapseIcon sx={{ fontSize: 13, color: '#94A3B8' }} />}
          </Box>
          <Collapse in={!planCollapsed}>
            <PlanDisplay steps={steps} />
          </Collapse>
        </Box>
      )}

      {/* Synthesis */}
      {hasSynthesis && (
        <Box sx={{ borderRadius: 2, border: '1px solid #E8ECF0', overflow: 'hidden', mb: artifacts.length > 0 ? 1.5 : 0 }}>
          <Box sx={{ px: 2.5, py: 2.5, backgroundColor: '#fff' }}>
            {renderMarkdown(synthesis)}
            {streaming && (
              <Box component="span" sx={{ display: 'inline-block', width: 2, height: '1em', backgroundColor: '#3B82F6', ml: 0.5, animation: 'blink 1s step-end infinite', '@keyframes blink': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0 } } }} />
            )}
          </Box>
        </Box>
      )}

      {/* Artifacts */}
      {artifacts.length > 0 && (
        <Stack spacing={0.75}>
          {artifacts.map(a => (
            <Box key={a.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25, borderRadius: 1.5, border: '1px solid #E8ECF0', backgroundColor: '#F8FAFC' }}>
              <DownloadIcon sx={{ fontSize: 15, color: '#4F46E5' }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</Typography>
                {a.size && <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8' }}>{a.type.toUpperCase()} · {Math.round(a.size / 1024)} KB</Typography>}
              </Box>
              <Button
                size="small"
                component="a" href={artifactDownloadUrl(a.id)} download={a.name}
                sx={{ fontSize: '0.75rem', color: '#4F46E5', fontWeight: 600, textTransform: 'none', px: 1.5, border: '1px solid #C7D2FE', borderRadius: 1.5, '&:hover': { backgroundColor: '#EEF2FF' } }}
              >
                Download
              </Button>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};

// ── Session history sidebar ───────────────────────────────────────────────────

const SessionSidebar: React.FC<{ tab: AgentTab; onSelect: (id: string) => void; currentId?: string }> = ({ tab, onSelect, currentId }) => {
  const [sessions, setSessions] = useState<AgentSession[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      listSessions(tab).then(setSessions).catch(() => {});
    }
  }, [open, tab]);

  return (
    <>
      <Tooltip title="History">
        <IconButton size="small" onClick={() => setOpen(o => !o)} sx={{ p: 0.75 }}>
          <HistoryIcon sx={{ fontSize: 17, color: open ? '#4F46E5' : '#94A3B8' }} />
        </IconButton>
      </Tooltip>
      {open && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute', top: '100%', right: 0, width: 300, maxHeight: 400,
            overflowY: 'auto', borderRadius: 2, border: '1px solid #E8ECF0', zIndex: 200,
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-thumb': { backgroundColor: '#E2E8F0', borderRadius: 4 },
          }}
        >
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #F1F5F9' }}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151' }}>Previous sessions</Typography>
          </Box>
          {sessions.length === 0
            ? <Box sx={{ p: 2 }}><Typography sx={{ fontSize: '0.8rem', color: '#94A3B8' }}>No sessions yet</Typography></Box>
            : sessions.map(s => (
              <Box
                key={s.id}
                onClick={() => { onSelect(s.id); setOpen(false); }}
                sx={{
                  px: 2, py: 1.25, cursor: 'pointer', borderBottom: '1px solid #F8FAFC',
                  backgroundColor: s.id === currentId ? '#EEF2FF' : 'transparent',
                  '&:hover': { backgroundColor: '#F8FAFF' },
                }}
              >
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: '#0F172A', mb: 0.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.title}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                  {s._count?.messages ?? 0} messages · {new Date(s.updatedAt).toLocaleDateString('en-IN')}
                </Typography>
              </Box>
            ))
          }
        </Paper>
      )}
    </>
  );
};

// ── Agent input ───────────────────────────────────────────────────────────────

const PLACEHOLDER: Record<AgentTab, string> = {
  research: 'Ask anything — e.g. "Find Phase 3 recruiting trials for NSCLC in India with an immunotherapy arm"',
  match: 'Describe a patient — e.g. "44yo female, ECOG 1, relapsed DLBCL, prior R-CHOP, no prior CAR-T"',
  regulatory: 'Ask regulatory question — e.g. "What CDSCO approvals do I need for a Phase 2 oncology trial?"',
  protocol: 'Describe your trial — e.g. "Design a Phase 2 RCT comparing pembrolizumab + chemo vs chemo alone in NSCLC"',
  edc: 'Ask about your data — e.g. "Are there any missing vitals or protocol deviations in the last 30 days?"',
  analysis: 'Request analysis — e.g. "Generate a safety summary report for all enrolled patients"',
};

interface InputBoxProps {
  large?: boolean;
  tab: AgentTab;
  input: string;
  running: boolean;
  onInputChange: (v: string) => void;
  onSubmit: (q: string) => void;
  onStop: () => void;
}

const InputBox: React.FC<InputBoxProps> = ({ large = false, tab, input, running, onInputChange, onSubmit, onStop }) => (
  <Box sx={{
    display: 'flex', alignItems: 'flex-end', gap: 1,
    border: '1.5px solid', borderColor: running ? '#4F46E5' : '#E2E8F0',
    borderRadius: large ? 3 : 2.5,
    px: large ? 2.5 : 1.75, py: large ? 1.75 : 1,
    backgroundColor: '#fff',
    boxShadow: large ? '0 4px 24px rgba(0,0,0,0.07)' : running ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none',
    transition: 'all 0.2s',
    '&:focus-within': large ? { borderColor: '#4F46E5', boxShadow: '0 0 0 3px rgba(79,70,229,0.1)' } : {},
  }}>
    <InputBase
      fullWidth multiline maxRows={large ? 4 : 5}
      placeholder={PLACEHOLDER[tab]}
      value={input}
      onChange={e => onInputChange(e.target.value)}
      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSubmit(input); } }}
      disabled={running}
      sx={{ fontSize: large ? '1rem' : '0.875rem', color: '#0A1628', flex: 1, '& textarea::placeholder': { color: '#94A3B8' } }}
    />
    {running
      ? <IconButton size="small" onClick={onStop} sx={{ p: large ? 1 : 0.75, backgroundColor: '#FEF2F2', borderRadius: 1.5, '&:hover': { backgroundColor: '#FEE2E2' } }}>
          <StopIcon sx={{ fontSize: large ? 18 : 16, color: '#EF4444' }} />
        </IconButton>
      : <IconButton size="small" onClick={() => onSubmit(input)} disabled={!input.trim()}
          sx={{ p: large ? 1 : 0.75, backgroundColor: input.trim() ? '#4F46E5' : '#F1F5F9', borderRadius: large ? 2 : 1.5, '&:hover': { backgroundColor: '#4338CA' }, '&:disabled': { backgroundColor: '#F1F5F9' }, transition: 'background 0.15s' }}>
          <SendIcon sx={{ fontSize: large ? 18 : 15, color: input.trim() ? '#fff' : '#CBD5E1' }} />
        </IconButton>
    }
  </Box>
);

// ── Main component ────────────────────────────────────────────────────────────

interface AgentMessage {
  id: string;
  type: 'user' | 'assistant';
  text?: string;
  steps: StepState[];
  synthesis: string;
  artifacts: { id: string; name: string; type: string; size?: number }[];
  streaming: boolean;
}

interface AgentChatPanelProps {
  tab: AgentTab;
  title: string;
  suggestedQueries?: string[];
}

export const AgentChatPanel: React.FC<AgentChatPanelProps> = ({ tab, title, suggestedQueries = [] }) => {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSession = useCallback(async (id: string) => {
    const data = await getSession(id);
    if (!data) return;
    setSessionId(id);
    const rebuilt: AgentMessage[] = [];
    for (const m of data.messages) {
      if (m.role === 'user') {
        rebuilt.push({ id: m.id, type: 'user', text: m.content, steps: [], synthesis: '', artifacts: [], streaming: false });
      } else if (m.role === 'assistant') {
        const lastUser = [...rebuilt].reverse().find(x => x.type === 'user');
        if (lastUser) {
          rebuilt.push({
            id: m.id, type: 'assistant', steps: [], synthesis: m.content, streaming: false,
            artifacts: data.artifacts.filter(a => a.sessionId === id).map(a => ({ id: a.id, name: a.name, type: a.type })),
          });
        }
      }
    }
    setMessages(rebuilt);
  }, []);

  const handleSubmit = useCallback(async (query: string) => {
    if (!query.trim() || running) return;
    const q = query.trim();
    setInput('');
    setRunning(true);

    // Create session if needed
    let sid = sessionId;
    if (!sid) {
      try {
        sid = await createSession(tab, q.slice(0, 100));
        setSessionId(sid);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to connect to agent service';
        setInput(q);  // restore what user typed
        setRunning(false);
        setMessages(prev => [...prev, {
          id: `err-${Date.now()}`,
          type: 'assistant' as const,
          steps: [],
          synthesis: `⚠️ ${msg}. Please refresh and try again.`,
          artifacts: [],
          streaming: false,
        }]);
        return;
      }
    }

    const userMsgId = `user-${Date.now()}`;
    const asstMsgId = `asst-${Date.now()}`;

    setMessages(prev => [
      ...prev,
      { id: userMsgId, type: 'user', text: q, steps: [], synthesis: '', artifacts: [], streaming: false },
      { id: asstMsgId, type: 'assistant', steps: [], synthesis: '', artifacts: [], streaming: true },
    ]);

    const stop = streamRun({
      sessionId: sid!,
      tab,
      query: q,
      onEvent: (event) => {
        setMessages(prev => prev.map(m => {
          if (m.id !== asstMsgId) return m;
          switch (event.type) {
            case 'plan':
              return { ...m, steps: (event.payload.steps ?? []).map(s => ({ ...s, status: 'pending' as const })) };
            case 'tool_start':
              return { ...m, steps: m.steps.map(s => s.step === event.payload.step ? { ...s, status: 'running' as const } : s) };
            case 'tool_done':
              return { ...m, steps: m.steps.map(s => s.step === event.payload.step ? { ...s, status: (event.payload.status === 'ok' ? 'done' : 'error') as any, count: event.payload.count } : s) };
            case 'synthesis_chunk':
              return { ...m, synthesis: m.synthesis + (event.payload.text ?? '') };
            case 'artifact':
              return { ...m, artifacts: [...m.artifacts, { id: event.payload.id!, name: event.payload.name!, type: 'markdown', size: event.payload.size }] };
            default:
              return m;
          }
        }));
      },
      onDone: () => {
        setMessages(prev => prev.map(m => m.id === asstMsgId ? { ...m, streaming: false } : m));
        setRunning(false);
      },
      onError: (err) => {
        setMessages(prev => prev.map(m => m.id === asstMsgId ? { ...m, streaming: false, synthesis: m.synthesis || `Error: ${err}` } : m));
        setRunning(false);
      },
    });

    stopRef.current = stop;
  }, [running, sessionId, tab]);

  const handleStop = () => { stopRef.current?.(); stopRef.current = null; setRunning(false); setMessages(prev => prev.map(m => m.streaming ? { ...m, streaming: false } : m)); };
  const handleNewChat = () => { setMessages([]); setSessionId(null); setInput(''); };

  const isEmpty = messages.length === 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>

      {/* ── IDLE STATE — centered search, SciSpace style ── */}
      {isEmpty && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3, pb: 6, overflow: 'auto' }}>
          {/* Icon + title */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '20px', backgroundColor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5, boxShadow: '0 2px 12px rgba(79,70,229,0.15)' }}>
              <AIIcon sx={{ fontSize: 32, color: '#4F46E5' }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#0F172A', letterSpacing: '-0.01em', mb: 0.75 }}>{title}</Typography>
            <Typography sx={{ fontSize: '0.9rem', color: '#64748B' }}>Powered by AI agents · PubMed · ClinicalTrials.gov · CTRI</Typography>
          </Box>

          {/* Large centered search bar */}
          <Box sx={{ width: '100%', maxWidth: 700, mb: 4 }}>
            <InputBox large tab={tab} input={input} running={running} onInputChange={setInput} onSubmit={q => void handleSubmit(q)} onStop={handleStop} />
            <Typography sx={{ fontSize: '0.68rem', color: '#CBD5E1', mt: 1, textAlign: 'center' }}>
              Enter to search · Shift+Enter for new line
            </Typography>
          </Box>

          {/* Suggested queries — 2-column grid */}
          {suggestedQueries.length > 0 && (
            <Box sx={{ width: '100%', maxWidth: 700 }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', mb: 1.5 }}>
                Try asking
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                {suggestedQueries.map(q => (
                  <Box key={q} onClick={() => void handleSubmit(q)} sx={{
                    p: 1.5, borderRadius: 2, border: '1px solid #E8ECF0', cursor: 'pointer',
                    backgroundColor: '#FAFAFA',
                    '&:hover': { borderColor: '#C7D2FE', backgroundColor: '#F5F3FF', '& p': { color: '#4F46E5' } },
                    transition: 'all 0.15s',
                  }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#374151', lineHeight: 1.45, transition: 'color 0.15s' }}>{q}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Session history — subtle link below */}
          <Box sx={{ mt: 3 }}>
            <SessionSidebar tab={tab} onSelect={loadSession} currentId={undefined} />
          </Box>
        </Box>
      )}

      {/* ── ACTIVE STATE — chat layout ── */}
      {!isEmpty && (
        <>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25, borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
            <Box sx={{ width: 26, height: 26, borderRadius: 1.5, backgroundColor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AIIcon sx={{ fontSize: 14, color: '#4F46E5' }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F172A', flex: 1 }}>{title}</Typography>
            <Tooltip title="New chat">
              <Button size="small" onClick={handleNewChat} sx={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'none', px: 1, border: '1px solid #E8ECF0', borderRadius: 1.5, minHeight: 'auto', '&:hover': { borderColor: '#4F46E5', color: '#4F46E5' } }}>
                + New
              </Button>
            </Tooltip>
            <SessionSidebar tab={tab} onSelect={loadSession} currentId={sessionId ?? undefined} />
          </Box>

          {/* Messages */}
          <Box sx={{ flex: 1, overflowY: 'auto', py: 2, px: 2, minHeight: 0, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#E2E8F0', borderRadius: 4 } }}>
            {messages.map(m => (
              <Box key={m.id}>
                {m.type === 'user'
                  ? <UserMessage text={m.text ?? ''} />
                  : <AssistantMessage steps={m.steps} synthesis={m.synthesis} artifacts={m.artifacts} streaming={m.streaming} />
                }
              </Box>
            ))}
            <div ref={bottomRef} />
          </Box>

          {/* Input */}
          <Box sx={{ flexShrink: 0, px: 2, pt: 1.5, pb: 1.5, borderTop: '1px solid #F1F5F9' }}>
            <InputBox tab={tab} input={input} running={running} onInputChange={setInput} onSubmit={q => void handleSubmit(q)} onStop={handleStop} />
            <Typography sx={{ fontSize: '0.65rem', color: '#CBD5E1', mt: 0.75, textAlign: 'center' }}>
              Enter to send · Shift+Enter for new line · Powered by NexTrial Agent
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

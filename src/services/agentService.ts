const API_BASE = import.meta.env['VITE_API_URL'] || 'http://localhost:3001/api';

export type AgentTab = 'research' | 'match' | 'regulatory' | 'edc' | 'analysis' | 'protocol';

export interface PlannedStep { step: number; tool: string; query: string; reason: string; }

export interface StreamEvent {
  type: 'plan' | 'tool_start' | 'tool_done' | 'synthesis_start' | 'synthesis_chunk' | 'artifact' | 'done' | 'error';
  payload: {
    steps?: PlannedStep[];
    step?: number; tool?: string; query?: string; reason?: string;
    status?: string; count?: number;
    text?: string;
    id?: string; name?: string; size?: number;
    sessionId?: string; message?: string;
  };
}

export interface AgentSession {
  id: string; userId: string; tab: AgentTab; title: string;
  createdAt: string; updatedAt: string;
  _count?: { messages: number };
  artifacts?: AgentArtifact[];
}

export interface AgentMessage {
  id: string; sessionId: string; role: 'user' | 'assistant' | 'tool';
  content: string; toolName?: string; createdAt: string;
}

export interface AgentArtifact {
  id: string; sessionId: string; name: string; type: string;
  content?: string; createdAt: string;
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Create a new agent session, return sessionId
export async function createSession(tab: AgentTab, title: string): Promise<string> {
  const res = await fetch(`${API_BASE}/agent/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ tab, title }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error ?? 'Failed to create session');
  return json.data.id as string;
}

// List sessions for a tab
export async function listSessions(tab?: AgentTab): Promise<AgentSession[]> {
  const url = tab ? `${API_BASE}/agent/sessions?tab=${tab}` : `${API_BASE}/agent/sessions`;
  const res = await fetch(url, { headers: authHeaders() });
  const json = await res.json();
  return json.success ? (json.data as AgentSession[]) : [];
}

// Get full session history
export async function getSession(sessionId: string): Promise<{ session: AgentSession; messages: AgentMessage[]; artifacts: AgentArtifact[] } | null> {
  const res = await fetch(`${API_BASE}/agent/sessions/${sessionId}`, { headers: authHeaders() });
  const json = await res.json();
  if (!json.success) return null;
  return { session: json.data, messages: json.data.messages ?? [], artifacts: json.data.artifacts ?? [] };
}

// Stream agent run via SSE
export function streamRun(opts: {
  sessionId: string;
  tab: AgentTab;
  query: string;
  onEvent: (event: StreamEvent) => void;
  onDone: () => void;
  onError: (err: string) => void;
}): () => void {
  const { sessionId, tab, query, onEvent, onDone, onError } = opts;
  const token = localStorage.getItem('auth_token') || '';
  const params = new URLSearchParams({ query, tab, token });
  const url = `${API_BASE}/agent/run/${sessionId}/stream?${params}`;

  const source = new EventSource(url);

  source.onmessage = (e) => {
    try {
      const event: StreamEvent = JSON.parse(e.data as string);
      onEvent(event);
      if (event.type === 'done') { source.close(); onDone(); }
      if (event.type === 'error') { source.close(); onError(event.payload.message ?? 'Agent error'); }
    } catch {
      // ignore malformed events
    }
  };

  source.onerror = () => {
    source.close();
    onError('Connection lost');
  };

  return () => source.close();
}

// Download artifact URL
export function artifactDownloadUrl(artifactId: string): string {
  const token = localStorage.getItem('auth_token') || '';
  return `${API_BASE}/agent/artifacts/${artifactId}/download?token=${token}`;
}

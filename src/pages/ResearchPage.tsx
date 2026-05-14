import React, { useState, useRef, useCallback } from 'react';
import {
  Box, Typography, InputBase, IconButton, Chip, Stack, Card, CardContent,
  Tab, Tabs, alpha, CircularProgress, Link, Button, Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon, Close as CloseIcon, AutoAwesome as AIIcon,
  Science as PubMedIcon, LocalHospital as TrialIcon, Public as CTRIIcon,
  OpenInNew as OpenIcon, Lightbulb as SuggestionIcon,
  ContentCopy as CopyIcon, BookmarkBorder as BookmarkIcon,
} from '@mui/icons-material';
import { TopNavigation } from '../components/layout/TopNavigation';

const API_BASE = import.meta.env['VITE_API_URL'] || 'http://localhost:3001/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AISynthesis {
  enrichedKnowledge: string;
  searchSuggestions: string[];
  relatedTopics: string[];
}

interface PubMedArticle {
  pmid: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  doi?: string;
  abstract?: string;
  source: string;
  relevanceScore?: number;
}

interface ClinicalTrial {
  nctId: string;
  title: string;
  status: string;
  phase: string;
  condition: string;
  intervention: string;
  enrollment: number;
  sponsor: string;
  startDate?: string;
  description: string;
  source: string;
}

interface SearchResults {
  synthesis: AISynthesis | null;
  articles: PubMedArticle[];
  trials: ClinicalTrial[];
  totalArticles: number;
  totalTrials: number;
  query: string;
}

// ── API layer ─────────────────────────────────────────────────────────────────

async function fetchSynthesis(query: string): Promise<AISynthesis | null> {
  try {
    const res = await fetch(`${API_BASE}/research/natural-language`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const json = await res.json();
    return json.success ? json.data : null;
  } catch { return null; }
}

async function fetchSearchResults(query: string): Promise<{ articles: PubMedArticle[]; trials: ClinicalTrial[]; totalArticles: number; totalTrials: number }> {
  try {
    const res = await fetch(`${API_BASE}/research/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        filters: {},
        sources: ['pubmed', 'clinicaltrials'],
      }),
    });
    const json = await res.json();
    if (!json.success) return { articles: [], trials: [], totalArticles: 0, totalTrials: 0 };
    const data = json.data;
    return {
      articles: data.pubMed?.articles ?? [],
      trials: data.clinicalTrials?.trials ?? [],
      totalArticles: data.pubMed?.count ?? 0,
      totalTrials: data.clinicalTrials?.count ?? 0,
    };
  } catch { return { articles: [], trials: [], totalArticles: 0, totalTrials: 0 }; }
}

// ── Example queries ───────────────────────────────────────────────────────────

const EXAMPLE_QUERIES = [
  'Phase 3 trials for Type 2 Diabetes in India',
  'CAR-T cell therapy clinical trials',
  'Metformin cardiovascular outcomes',
  'CDSCO approved oncology trials 2024',
  'Ivermectin COVID-19 randomized trials',
  'Tuberculosis treatment India latest trials',
];

// ── Loading sequence ──────────────────────────────────────────────────────────

const LOADING_STEPS = [
  { label: 'Searching PubMed…', icon: PubMedIcon, color: '#7C3AED' },
  { label: 'Querying ClinicalTrials.gov…', icon: TrialIcon, color: '#0047AB' },
  { label: 'Synthesizing with AI…', icon: AIIcon, color: '#00897B' },
];

const LoadingState: React.FC<{ step: number }> = ({ step }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, gap: 3 }}>
    <CircularProgress size={40} sx={{ color: '#0047AB' }} />
    <Stack spacing={1.5} alignItems="center">
      {LOADING_STEPS.map((s, i) => {
        const Icon = s.icon;
        const active = i === step;
        const done = i < step;
        return (
          <Box key={s.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, opacity: active ? 1 : done ? 0.5 : 0.2, transition: 'opacity 0.4s ease' }}>
            <Icon sx={{ fontSize: 18, color: done || active ? s.color : '#B0BEC5' }} />
            <Typography sx={{ fontSize: '0.9rem', color: active ? '#0A1628' : '#546E7A', fontWeight: active ? 600 : 400 }}>
              {s.label}
            </Typography>
            {done && <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#059669' }} />}
          </Box>
        );
      })}
    </Stack>
  </Box>
);

// ── AI Synthesis panel ────────────────────────────────────────────────────────

const AISynthesisPanel: React.FC<{ synthesis: AISynthesis; query: string; onSuggestionClick: (s: string) => void }> = ({
  synthesis, onSuggestionClick,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(synthesis.enrichedKnowledge ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card sx={{ mb: 3, border: '1px solid', borderColor: alpha('#7C3AED', 0.2), boxShadow: `0 4px 24px ${alpha('#7C3AED', 0.08)}`, borderRadius: 3 }}>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 28, height: 28, borderRadius: 1.5, background: 'linear-gradient(135deg, #7C3AED, #0047AB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AIIcon sx={{ fontSize: 14, color: '#fff' }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0A1628' }}>AI Research Synthesis</Typography>
            <Chip label="Powered by Perplexity" size="small" sx={{ fontSize: '0.65rem', height: 18, backgroundColor: alpha('#7C3AED', 0.08), color: '#7C3AED', fontWeight: 600 }} />
          </Box>
          <Tooltip title={copied ? 'Copied!' : 'Copy synthesis'}>
            <IconButton size="small" onClick={handleCopy}>
              <CopyIcon sx={{ fontSize: 16, color: copied ? '#059669' : '#90A4AE' }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Synthesis text */}
        <Typography
          component="div"
          sx={{
            fontSize: '0.9rem',
            color: '#0A1628',
            lineHeight: 1.8,
            mb: 2.5,
            whiteSpace: 'pre-wrap',
            '& strong': { fontWeight: 700 },
          }}
        >
          {synthesis.enrichedKnowledge}
        </Typography>

        {/* Search suggestions */}
        {synthesis.searchSuggestions?.length > 0 && (
          <Box mb={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
              <SuggestionIcon sx={{ fontSize: 14, color: '#0047AB' }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0047AB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Refine your search
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {synthesis.searchSuggestions.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  size="small"
                  onClick={() => onSuggestionClick(s)}
                  sx={{ fontSize: '0.8rem', height: 26, cursor: 'pointer', backgroundColor: '#EFF6FF', color: '#0047AB', '&:hover': { backgroundColor: alpha('#0047AB', 0.12) } }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Related topics */}
        {synthesis.relatedTopics?.length > 0 && (
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#546E7A', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>
              Related topics
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {synthesis.relatedTopics.map((t) => (
                <Chip
                  key={t}
                  label={t}
                  size="small"
                  variant="outlined"
                  onClick={() => onSuggestionClick(t)}
                  sx={{ fontSize: '0.78rem', height: 26, cursor: 'pointer', borderColor: '#D0D9E8', color: '#546E7A', '&:hover': { borderColor: '#0047AB', color: '#0047AB' } }}
                />
              ))}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// ── Article card ──────────────────────────────────────────────────────────────

const ArticleCard: React.FC<{ article: PubMedArticle }> = ({ article }) => (
  <Card sx={{ border: '1px solid #E8EDF5', boxShadow: 'none', borderRadius: 2.5, mb: 1.5, transition: 'all 0.2s', '&:hover': { borderColor: '#0047AB', boxShadow: `0 4px 16px ${alpha('#0047AB', 0.08)}` } }}>
    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Box flex={1}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
            <Chip label="PubMed" size="small" sx={{ fontSize: '0.65rem', height: 18, backgroundColor: alpha('#7C3AED', 0.08), color: '#7C3AED', fontWeight: 600 }} />
            {article.year && <Typography sx={{ fontSize: '0.75rem', color: '#90A4AE' }}>{article.year}</Typography>}
          </Box>
          <Link
            href={`https://pubmed.ncbi.nlm.nih.gov/${article.pmid}`}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            sx={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: '#0A1628', lineHeight: 1.4, mb: 0.5, '&:hover': { color: '#0047AB' } }}
          >
            {article.title}
          </Link>
          <Typography sx={{ fontSize: '0.8rem', color: '#546E7A', mb: 0.5 }}>
            {article.authors && `${article.authors.split(',').slice(0, 3).join(', ')}${article.authors.split(',').length > 3 ? ' et al.' : ''}`}
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: '#90A4AE', fontStyle: 'italic' }}>{article.journal}</Typography>
        </Box>
        <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
          <Tooltip title="Bookmark">
            <IconButton size="small"><BookmarkIcon sx={{ fontSize: 16 }} /></IconButton>
          </Tooltip>
          <Tooltip title="Open in PubMed">
            <IconButton size="small" component="a" href={`https://pubmed.ncbi.nlm.nih.gov/${article.pmid}`} target="_blank">
              <OpenIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </CardContent>
  </Card>
);

// ── Trial card ────────────────────────────────────────────────────────────────

const statusStyle = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes('recruiting')) return { bg: '#ECFDF5', color: '#065F46' };
  if (s.includes('completed')) return { bg: '#EFF6FF', color: '#1E40AF' };
  if (s.includes('terminated') || s.includes('withdrawn')) return { bg: '#FEF2F2', color: '#991B1B' };
  return { bg: '#F3F4F6', color: '#374151' };
};

const TrialCard: React.FC<{ trial: ClinicalTrial }> = ({ trial }) => {
  const ss = statusStyle(trial.status);
  return (
    <Card sx={{ border: '1px solid #E8EDF5', boxShadow: 'none', borderRadius: 2.5, mb: 1.5, transition: 'all 0.2s', '&:hover': { borderColor: '#0047AB', boxShadow: `0 4px 16px ${alpha('#0047AB', 0.08)}` } }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Box flex={1}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={0.75}>
              <Chip label={trial.status} size="small" sx={{ fontSize: '0.65rem', height: 18, backgroundColor: ss.bg, color: ss.color, fontWeight: 600 }} />
              {trial.phase && trial.phase !== 'Not Applicable' && (
                <Chip label={trial.phase} size="small" sx={{ fontSize: '0.65rem', height: 18, backgroundColor: '#EFF6FF', color: '#0047AB', fontWeight: 600 }} />
              )}
              <Typography sx={{ fontSize: '0.72rem', color: '#90A4AE', lineHeight: '18px' }}>{trial.nctId}</Typography>
            </Stack>
            <Link
              href={`https://clinicaltrials.gov/study/${trial.nctId}`}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: '#0A1628', lineHeight: 1.4, mb: 1, '&:hover': { color: '#0047AB' } }}
            >
              {trial.title}
            </Link>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              {trial.condition && <Typography sx={{ fontSize: '0.78rem', color: '#546E7A' }}>Condition: <strong>{trial.condition}</strong></Typography>}
              {trial.enrollment > 0 && <Typography sx={{ fontSize: '0.78rem', color: '#546E7A' }}>N = {trial.enrollment.toLocaleString()}</Typography>}
              {trial.sponsor && <Typography sx={{ fontSize: '0.78rem', color: '#546E7A' }}>Sponsor: {trial.sponsor}</Typography>}
            </Stack>
          </Box>
          <Tooltip title="Open in ClinicalTrials.gov">
            <IconButton size="small" component="a" href={`https://clinicaltrials.gov/study/${trial.nctId}`} target="_blank">
              <OpenIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

// ── Empty tab state ───────────────────────────────────────────────────────────

const EmptyTabState: React.FC<{ label: string; comingSoon?: boolean }> = ({ label, comingSoon }) => (
  <Box sx={{ textAlign: 'center', py: 8 }}>
    <Typography sx={{ fontSize: '0.9rem', color: '#546E7A' }}>
      {comingSoon ? `${label} — Live integration coming soon` : `No ${label.toLowerCase()} found for this query`}
    </Typography>
  </Box>
);

// ── Main page ─────────────────────────────────────────────────────────────────

type PageState = 'idle' | 'loading' | 'results';

export const ResearchPage: React.FC = () => {
  const [draftQuery, setDraftQuery] = useState('');
  const [pageState, setPageState] = useState<PageState>('idle');
  const [loadingStep, setLoadingStep] = useState(0);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    const trimmed = q.trim();
    setDraftQuery(trimmed);
    setPageState('loading');
    setLoadingStep(0);
    setResults(null);

    // Animate the loading steps
    const t1 = setTimeout(() => setLoadingStep(1), 1200);
    const t2 = setTimeout(() => setLoadingStep(2), 2800);

    const [synthesis, search] = await Promise.all([
      fetchSynthesis(trimmed),
      fetchSearchResults(trimmed),
    ]);

    clearTimeout(t1); clearTimeout(t2);

    setResults({
      synthesis,
      articles: search.articles,
      trials: search.trials,
      totalArticles: search.totalArticles,
      totalTrials: search.totalTrials,
      query: trimmed,
    });
    setActiveTab(0);
    setPageState('results');
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') runSearch(draftQuery);
  };

  const handleClear = () => {
    setDraftQuery('');
    setPageState('idle');
    setResults(null);
    inputRef.current?.focus();
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F7F9FC', display: 'flex', flexDirection: 'column' }}>
      <TopNavigation />

      {/* Search bar — always visible, transitions from center to top */}
      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #E8EDF5',
          px: { xs: 2, md: 4 },
          py: pageState === 'idle' ? 0 : 2,
          ...(pageState === 'idle' && {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }),
        }}
      >
        {pageState === 'idle' && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: 2, background: 'linear-gradient(135deg, #7C3AED, #0047AB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AIIcon sx={{ fontSize: 16, color: '#fff' }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#0A1628', letterSpacing: '-0.02em' }}>
                Research Intelligence
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '1rem', color: '#546E7A', mb: 4, textAlign: 'center', maxWidth: 520 }}>
              Ask anything about clinical trials, literature, or your research area.
              NexTrial searches PubMed, ClinicalTrials.gov, and synthesizes with AI.
            </Typography>
          </>
        )}

        {/* The search input */}
        <Box
          sx={{
            width: '100%',
            maxWidth: pageState === 'idle' ? 720 : 800,
            mx: pageState !== 'idle' ? 'auto' : undefined,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            backgroundColor: '#ffffff',
            border: '2px solid',
            borderColor: '#0047AB',
            borderRadius: 3,
            px: 2,
            py: 0.75,
            boxShadow: pageState === 'idle' ? '0 4px 24px rgba(0,71,171,0.12)' : 'none',
            transition: 'all 0.3s ease',
          }}
        >
          <SearchIcon sx={{ color: '#0047AB', fontSize: 20, flexShrink: 0 }} />
          <InputBase
            inputRef={inputRef}
            fullWidth
            autoFocus={pageState === 'idle'}
            placeholder='Ask anything — e.g. "Phase 3 diabetes trials India" or "CAR-T therapy latest outcomes"'
            value={draftQuery}
            onChange={(e) => setDraftQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{ fontSize: '0.95rem', color: '#0A1628', '& input::placeholder': { color: '#90A4AE' } }}
          />
          {draftQuery && (
            <IconButton size="small" onClick={handleClear} sx={{ flexShrink: 0 }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          )}
          <Button
            variant="contained"
            size="small"
            onClick={() => runSearch(draftQuery)}
            disabled={!draftQuery.trim() || pageState === 'loading'}
            sx={{ flexShrink: 0, background: 'linear-gradient(135deg, #0047AB 0%, #00897B 100%)', fontWeight: 700, px: 2.5, py: 0.75, borderRadius: 2, boxShadow: 'none', minWidth: 80 }}
          >
            Search
          </Button>
        </Box>

        {/* Example queries — only in idle state */}
        {pageState === 'idle' && (
          <Box mt={3} sx={{ textAlign: 'center', maxWidth: 720 }}>
            <Typography sx={{ fontSize: '0.75rem', color: '#90A4AE', mb: 1.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Try these
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
              {EXAMPLE_QUERIES.map((eq) => (
                <Chip
                  key={eq}
                  label={eq}
                  onClick={() => runSearch(eq)}
                  sx={{ fontSize: '0.8rem', height: 28, cursor: 'pointer', backgroundColor: '#EFF6FF', color: '#0047AB', border: '1px solid', borderColor: alpha('#0047AB', 0.2), '&:hover': { backgroundColor: alpha('#0047AB', 0.12) } }}
                />
              ))}
            </Stack>
          </Box>
        )}
      </Box>

      {/* Content area */}
      <Box sx={{ flex: 1, maxWidth: 900, width: '100%', mx: 'auto', px: { xs: 2, md: 3 }, py: 3 }}>
        {/* Loading */}
        {pageState === 'loading' && <LoadingState step={loadingStep} />}

        {/* Results */}
        {pageState === 'results' && results && (
          <>
            {/* Stats bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>
              <Typography sx={{ fontSize: '0.85rem', color: '#546E7A' }}>
                Results for <strong style={{ color: '#0A1628' }}>"{results.query}"</strong>
              </Typography>
              <Chip label={`${results.articles.length} papers`} size="small" sx={{ fontSize: '0.72rem', height: 20, backgroundColor: alpha('#7C3AED', 0.08), color: '#7C3AED' }} />
              <Chip label={`${results.trials.length} trials`} size="small" sx={{ fontSize: '0.72rem', height: 20, backgroundColor: alpha('#0047AB', 0.08), color: '#0047AB' }} />
            </Box>

            {/* AI Synthesis */}
            {results.synthesis?.enrichedKnowledge && (
              <AISynthesisPanel
                synthesis={results.synthesis}
                query={results.query}
                onSuggestionClick={runSearch}
              />
            )}

            {/* Tabs */}
            <Box sx={{ borderBottom: '1px solid #E8EDF5', mb: 2.5 }}>
              <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                sx={{
                  '& .MuiTab-root': { fontSize: '0.875rem', fontWeight: 500, textTransform: 'none', minWidth: 'auto', px: 2 },
                  '& .Mui-selected': { fontWeight: 700, color: '#0047AB' },
                  '& .MuiTabs-indicator': { backgroundColor: '#0047AB', height: 2.5 },
                }}
              >
                <Tab label={`Literature (${results.articles.length})`} />
                <Tab label={`Clinical Trials (${results.trials.length})`} />
                <Tab label="Indian Trials (CTRI)" />
              </Tabs>
            </Box>

            {/* Tab panels */}
            {activeTab === 0 && (
              results.articles.length > 0
                ? results.articles.map((a) => <ArticleCard key={a.pmid} article={a} />)
                : <EmptyTabState label="Literature" />
            )}
            {activeTab === 1 && (
              results.trials.length > 0
                ? results.trials.map((t) => <TrialCard key={t.nctId} trial={t} />)
                : <EmptyTabState label="Clinical Trials" />
            )}
            {activeTab === 2 && (
              <Box>
                <Box sx={{ mb: 2, p: 2.5, borderRadius: 2.5, backgroundColor: alpha('#D97706', 0.06), border: '1px solid', borderColor: alpha('#D97706', 0.2) }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CTRIIcon sx={{ fontSize: 16, color: '#D97706' }} />
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400E' }}>CTRI Direct Integration — Sprint 2</Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.82rem', color: '#92400E', lineHeight: 1.6 }}>
                    Direct CTRI (Clinical Trials Registry India) API integration is coming in Sprint 2.
                    For now, many Indian trials are discoverable via ClinicalTrials.gov above.
                    Use the search term <strong>"India"</strong> in your query to surface India-specific trials.
                  </Typography>
                  <Button
                    size="small"
                    endIcon={<OpenIcon sx={{ fontSize: 14 }} />}
                    component="a"
                    href="https://ctri.nic.in"
                    target="_blank"
                    sx={{ mt: 1.5, fontSize: '0.8rem', color: '#D97706', px: 0, py: 0, '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' } }}
                  >
                    Search CTRI directly
                  </Button>
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default ResearchPage;

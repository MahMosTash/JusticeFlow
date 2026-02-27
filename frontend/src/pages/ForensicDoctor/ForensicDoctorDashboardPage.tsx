// src/pages/ForensicDoctor/ForensicDoctorDashboardPage.tsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Link,
  Pagination,
} from '@mui/material';
import {
  Science,
  CheckCircle,
  Pending,
  ArrowForward,
  Image,
  Edit,
} from '@mui/icons-material';
import { evidenceService } from '@/services/evidenceService';
import { Evidence } from '@/types/api';
import { ROUTES } from '@/constants/routes';
import { formatDateTime } from '@/utils/dateUtils';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

// ─── small stat card ───────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => (
  <Card
    className="glass-effect"
    sx={{
      background: 'var(--glass-bg)',
      border: '1px solid var(--glass-border)',
      borderRadius: 'var(--radius-lg)',
      height: '100%',
    }}
  >
    <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: `${color}22`,
          border: `1.5px solid ${color}55`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          variant="h4"
          sx={{ color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1 }}
        >
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mt: 0.5 }}>
          {label}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

// ─── category badge ─────────────────────────────────────────────────────────
const categoryColor = (cat?: string) => {
  const map: Record<string, 'error' | 'warning' | 'info' | 'success' | 'default'> = {
    blood: 'error',
    hair: 'warning',
    fingerprint: 'info',
    dna: 'success',
    other: 'default',
  };
  return map[cat ?? ''] ?? 'default';
};

// ─── review dialog ─────────────────────────────────────────────────────────────
interface ReviewDialogProps {
  evidence: Evidence | null;
  open: boolean;
  onClose: () => void;
  onSaved: (updated: Evidence) => void;
  doctorNationalId: string;
}

const ReviewDialog: React.FC<ReviewDialogProps> = ({
  evidence,
  open,
  onClose,
  onSaved,
  doctorNationalId,
}) => {
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // pre-fill when reopening for an already-reviewed item
  useEffect(() => {
    if (evidence) {
      setNotes(evidence.verification_notes ?? '');
      setError('');
    }
  }, [evidence]);

  const handleSave = async () => {
    if (!evidence) return;
    if (!notes.trim()) {
      setError('Verification notes are required.');
      return;
    }
    try {
      setSaving(true);
      setError('');
      const updated = await evidenceService.verifyEvidence(evidence.id, {
        verified_by_national_id: doctorNationalId,
        verification_notes: notes.trim(),
      });
      onSaved(updated);
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.detail ||
          'Failed to save review. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const isUpdate = !!evidence?.verified_by_forensic_doctor;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-lg)',
        },
      }}
    >
      <DialogTitle
        sx={{
          color: 'var(--text-primary)',
          borderBottom: '1px solid var(--glass-border)',
          pb: 2,
        }}
      >
        {isUpdate ? '✏️ Update Review' : '🔬 Submit Forensic Review'}
        {evidence && (
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mt: 0.5 }}>
            {evidence.title}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* evidence summary */}
        {evidence && (
          <Box mb={3}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                  Category
                </Typography>
                <Box mt={0.5}>
                  <Chip
                    label={evidence.evidence_category || 'unspecified'}
                    color={categoryColor(evidence.evidence_category)}
                    size="small"
                  />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                  Case
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-primary)', mt: 0.5 }}>
                  {typeof evidence.case === 'object'
                    ? `#${evidence.case.id}: ${evidence.case.title}`
                    : `#${evidence.case}`}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                  Description
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-primary)', mt: 0.5 }}>
                  {evidence.description}
                </Typography>
              </Grid>

              {/* images */}
              {(evidence.image1 || evidence.image2 || evidence.image3) && (
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                    Attached Images
                  </Typography>
                  <Box display="flex" gap={1} mt={0.5} flexWrap="wrap">
                    {[evidence.image1, evidence.image2, evidence.image3]
                      .filter(Boolean)
                      .map((url, i) => (
                        <Link
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener"
                          underline="hover"
                          display="flex"
                          alignItems="center"
                          gap={0.5}
                          sx={{ color: 'var(--accent-primary)', fontSize: '0.8rem' }}
                        >
                          <Image fontSize="inherit" /> Image {i + 1}
                        </Link>
                      ))}
                  </Box>
                </Grid>
              )}
            </Grid>

            <Divider sx={{ my: 2, borderColor: 'var(--glass-border)' }} />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Forensic Review Notes *"
          multiline
          rows={5}
          fullWidth
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Provide your forensic analysis, findings, and recommendations for the detective…"
          sx={{
            '& .MuiOutlinedInput-root': {
              color: 'var(--text-primary)',
            },
            '& .MuiInputLabel-root': {
              color: 'var(--text-secondary)',
            },
          }}
        />

        {isUpdate && (
          <Alert severity="info" sx={{ mt: 2 }} icon={<Edit fontSize="small" />}>
            You have already reviewed this evidence. Saving will overwrite your previous notes and
            notify the detective.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid var(--glass-border)' }}>
        <Button onClick={onClose} disabled={saving} sx={{ color: 'var(--text-secondary)' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || !notes.trim()}
          startIcon={saving ? <CircularProgress size={16} /> : <CheckCircle />}
        >
          {saving ? 'Saving…' : isUpdate ? 'Update Review' : 'Submit Review'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── evidence card ─────────────────────────────────────────────────────────────
interface EvidenceCardProps {
  evidence: Evidence;
  onReview: (ev: Evidence) => void;
  onViewDetail: (ev: Evidence) => void;
}

const EvidenceCard: React.FC<EvidenceCardProps> = ({ evidence, onReview, onViewDetail }) => {
  const reviewed = !!evidence.verified_by_forensic_doctor;

  return (
    <Card
      className="glass-effect"
      sx={{
        background: 'var(--glass-bg)',
        border: reviewed
          ? '1px solid rgba(139, 115, 85, 0.5)'
          : '1px solid rgba(201, 125, 96, 0.4)',
        borderRadius: 'var(--radius-lg)',
        transition: 'all 200ms ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: 'var(--shadow-lg)' },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        {/* header row */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
          <Box flex={1} mr={1}>
            <Typography
              variant="h6"
              sx={{
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '1rem',
                lineHeight: 1.3,
              }}
            >
              {evidence.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mt: 0.25 }}>
              {typeof evidence.case === 'object'
                ? `Case #${evidence.case.id}: ${evidence.case.title}`
                : `Case #${evidence.case}`}
            </Typography>
          </Box>
          <Chip
            label={reviewed ? 'Reviewed' : 'Pending'}
            color={reviewed ? 'success' : 'warning'}
            size="small"
            icon={reviewed ? <CheckCircle fontSize="inherit" /> : <Pending fontSize="inherit" />}
            sx={{ flexShrink: 0 }}
          />
        </Box>

        {/* category + date */}
        <Box display="flex" gap={1} flexWrap="wrap" mb={1.5}>
          {evidence.evidence_category && (
            <Chip
              label={evidence.evidence_category}
              color={categoryColor(evidence.evidence_category)}
              size="small"
              variant="outlined"
            />
          )}
          <Typography variant="caption" sx={{ color: 'var(--text-secondary)', lineHeight: 2 }}>
            Recorded {formatDateTime(evidence.created_date)}
          </Typography>
        </Box>

        {/* description excerpt */}
        <Typography
          variant="body2"
          sx={{
            color: 'var(--text-secondary)',
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {evidence.description}
        </Typography>

        {/* existing notes preview */}
        {reviewed && evidence.verification_notes && (
          <Box
            sx={{
              background: 'rgba(139, 115, 85, 0.1)',
              border: '1px solid rgba(139, 115, 85, 0.3)',
              borderRadius: 'var(--radius-sm)',
              p: 1.5,
              mb: 2,
            }}
          >
            <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
              Your last review
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'var(--text-primary)',
                mt: 0.25,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {evidence.verification_notes}
            </Typography>
          </Box>
        )}

        {/* actions */}
        <Box display="flex" gap={1} justifyContent="flex-end">
          <Button
            size="small"
            variant="outlined"
            onClick={() => onViewDetail(evidence)}
            endIcon={<ArrowForward fontSize="small" />}
            sx={{
              borderColor: 'var(--glass-border)',
              color: 'var(--text-secondary)',
              fontSize: '0.75rem',
              '&:hover': {
                borderColor: 'var(--accent-primary)',
                color: 'var(--accent-primary)',
              },
            }}
          >
            View Detail
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={() => onReview(evidence)}
            startIcon={reviewed ? <Edit fontSize="small" /> : <Science fontSize="small" />}
            sx={{ fontSize: '0.75rem' }}
          >
            {reviewed ? 'Edit Review' : 'Review'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

// ─── main page ─────────────────────────────────────────────────────────────────
type TabKey = 'pending' | 'all';

export const ForensicDoctorDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => s.auth.user);

  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const [pendingList, setPendingList] = useState<Evidence[]>([]);
  const [allList, setAllList] = useState<Evidence[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [allCount, setAllCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  // dialog
  const [reviewTarget, setReviewTarget] = useState<Evidence | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const doctorNationalId = user?.national_id ?? '';

  // ── fetch helpers ──────────────────────────────────────────────────────────
  const fetchPending = useCallback(
    async (p: number) => {
      const data = await evidenceService.getUnansweredBiological({
        page: p,
        page_size: PAGE_SIZE,
      });
      setPendingList(data.results);
      setPendingCount(data.count);
    },
    []
  );

  const fetchAll = useCallback(async (p: number) => {
    const data = await evidenceService.getEvidence({
      evidence_type: 'biological',
      page: p,
      page_size: PAGE_SIZE,
    });
    setAllList(data.results);
    setAllCount(data.count);
  }, []);

  const loadData = useCallback(
    async (p: number) => {
      try {
        setLoading(true);
        setError('');
        if (activeTab === 'pending') {
          await fetchPending(p);
        } else {
          await fetchAll(p);
        }
      } catch {
        setError('Failed to load evidence. Please refresh.');
      } finally {
        setLoading(false);
      }
    },
    [activeTab, fetchPending, fetchAll]
  );

  // initial + tab/page change
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  useEffect(() => {
    loadData(page);
  }, [page, loadData]);

  // ── dialog handlers ────────────────────────────────────────────────────────
  const handleOpenReview = (ev: Evidence) => {
    setReviewTarget(ev);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setReviewTarget(null);
  };

  const handleSaved = (updated: Evidence) => {
    // optimistically update both lists
    const patch = (list: Evidence[]) =>
      list.map((e) => (e.id === updated.id ? updated : e));
    setPendingList((prev) => prev.filter((e) => e.id !== updated.id)); // move out of pending
    setAllList((prev) => patch(prev));
    if (pendingCount > 0) setPendingCount((c) => c - 1);
  };

  const handleViewDetail = (ev: Evidence) => {
    navigate(ROUTES.EVIDENCE_DETAIL(ev.id));
  };

  // ── derived ────────────────────────────────────────────────────────────────
  const displayList = activeTab === 'pending' ? pendingList : allList;
  const totalCount = activeTab === 'pending' ? pendingCount : allCount;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const reviewedCount = allCount - pendingCount;

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'var(--gradient-page-bg)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'var(--radial-glow-combined)',
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="xl" sx={{ py: 6, position: 'relative', zIndex: 1 }}>
        {/* ── page header ── */}
        <Box mb={5}>
          <Typography
            variant="h1"
            sx={{
              fontSize: 'var(--heading-h1-size)',
              fontWeight: 'var(--heading-h1-weight)',
              color: 'var(--text-primary)',
              mb: 1,
            }}
          >
            🧬 Forensic Lab
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--text-secondary)' }}>
            Review biological evidence and provide forensic analysis for detectives.
          </Typography>
        </Box>

        {/* ── stats row ── */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={4}>
            <StatCard
              label="Pending Reviews"
              value={pendingCount}
              icon={<Pending />}
              color="#c97d60"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard
              label="Reviewed by You"
              value={loading ? '—' : reviewedCount}
              icon={<CheckCircle />}
              color="#8b7355"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard
              label="Total Biological"
              value={loading ? '—' : allCount}
              icon={<Science />}
              color="#9d7f5f"
            />
          </Grid>
        </Grid>

        {/* ── tab bar ── */}
        <Box display="flex" gap={1} mb={3}>
          {(
            [
              { key: 'pending', label: `Pending (${pendingCount})` },
              { key: 'all', label: `All Biological (${allCount})` },
            ] as { key: TabKey; label: string }[]
          ).map(({ key, label }) => (
            <Button
              key={key}
              variant={activeTab === key ? 'contained' : 'outlined'}
              onClick={() => setActiveTab(key)}
              sx={
                activeTab !== key
                  ? {
                      borderColor: 'var(--glass-border)',
                      color: 'var(--text-secondary)',
                      '&:hover': {
                        borderColor: 'var(--accent-primary)',
                        color: 'var(--accent-primary)',
                      },
                    }
                  : {}
              }
            >
              {label}
            </Button>
          ))}
        </Box>

        {/* ── content ── */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={10}>
            <CircularProgress />
          </Box>
        ) : displayList.length === 0 ? (
          <Card
            className="glass-effect"
            sx={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-lg)',
              py: 8,
              textAlign: 'center',
            }}
          >
            <CardContent>
              <Science sx={{ fontSize: 64, color: 'var(--text-secondary)', mb: 2 }} />
              <Typography variant="h5" sx={{ color: 'var(--text-primary)', mb: 1 }}>
                {activeTab === 'pending'
                  ? 'No pending reviews — great work! 🎉'
                  : 'No biological evidence found.'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                {activeTab === 'pending'
                  ? 'All biological evidence has been reviewed.'
                  : 'Biological evidence will appear here once added by officers.'}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <>
            <Grid container spacing={3}>
              {displayList.map((ev) => (
                <Grid item xs={12} sm={6} lg={4} key={ev.id}>
                  <EvidenceCard
                    evidence={ev}
                    onReview={handleOpenReview}
                    onViewDetail={handleViewDetail}
                  />
                </Grid>
              ))}
            </Grid>

            {/* pagination */}
            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={4}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, p) => setPage(p)}
                  color="primary"
                  sx={{
                    '& .MuiPaginationItem-root': { color: 'var(--text-secondary)' },
                    '& .Mui-selected': { color: 'var(--text-primary)' },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Container>

      {/* ── review dialog ── */}
      <ReviewDialog
        evidence={reviewTarget}
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSaved={handleSaved}
        doctorNationalId={doctorNationalId}
      />
    </Box>
  );
};

/**
 * Forensic Doctor Dashboard
 * Shows all biological evidence with annotation (verify) capability.
 */
import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Collapse,
  Stack,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Science as ScienceIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as PendingIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { evidenceService } from '@/services/evidenceService';
import { Evidence } from '@/types/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  blood: 'Blood',
  hair: 'Hair',
  fingerprint: 'Fingerprint',
  dna: 'DNA',
  other: 'Other',
};

const CATEGORY_COLORS: Record<
  string,
  'error' | 'warning' | 'info' | 'success' | 'default'
> = {
  blood: 'error',
  hair: 'warning',
  fingerprint: 'info',
  dna: 'success',
  other: 'default',
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Annotation Form ─────────────────────────────────────────────────────────

interface AnnotationFormProps {
  evidence: Evidence;
  onSaved: (updated: Evidence) => void;
}

const AnnotationForm: React.FC<AnnotationFormProps> = ({ evidence, onSaved }) => {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(evidence.verification_notes ?? '');
  const [nationalId, setNationalId] = useState(evidence.verified_by_national_id ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const alreadyVerified = !!evidence.verified_by_forensic_doctor;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await evidenceService.verifyEvidence(evidence.id, {
        verified_by_national_id: nationalId.trim() || undefined,
        verification_notes: notes.trim(),
      });
      onSaved(updated);
      setOpen(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to save annotation.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setNotes(evidence.verification_notes ?? '');
    setNationalId(evidence.verified_by_national_id ?? '');
    setError(null);
    setOpen(false);
  };

  return (
    <Box sx={{ mt: 1.5 }}>
      {/* Toggle button */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <Tooltip title={alreadyVerified ? 'Update annotation' : 'Add annotation'}>
          <IconButton
            size="small"
            onClick={() => setOpen((prev) => !prev)}
            sx={{ color: 'var(--color-accent-primary)' }}
          >
            {open ? <CancelIcon fontSize="small" /> : <EditIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
          {alreadyVerified ? 'Update annotation' : 'Annotate this evidence'}
        </Typography>
      </Stack>

      {/* Collapsible form */}
      <Collapse in={open}>
        <Box
          sx={{
            mt: 1.5,
            p: 2,
            borderRadius: 2,
            background: 'var(--glass-bg, rgba(255,255,255,0.04))',
            border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
          }}
        >
          <Stack spacing={2}>
            <TextField
              label="Doctor National ID (optional)"
              size="small"
              fullWidth
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              placeholder="Leave blank to use your own ID"
              sx={{ '& .MuiInputBase-root': { fontSize: '0.85rem' } }}
            />
            <TextField
              label="Verification Notes"
              size="small"
              fullWidth
              multiline
              minRows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter forensic observations, lab results, conclusions…"
            />

            {error && (
              <Alert severity="error" sx={{ fontSize: '0.8rem' }}>
                {error}
              </Alert>
            )}

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                size="small"
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={saving ? <CircularProgress size={14} /> : <SaveIcon />}
                onClick={handleSave}
                disabled={saving}
                sx={{
                  background: 'var(--gradient-accent)',
                  '&:hover': { opacity: 0.9 },
                }}
              >
                {saving ? 'Saving…' : 'Save Annotation'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
};

// ─── Evidence Card ────────────────────────────────────────────────────────────

interface EvidenceCardProps {
  evidence: Evidence;
  onUpdated: (updated: Evidence) => void;
}

const BiologicalEvidenceCard: React.FC<EvidenceCardProps> = ({
  evidence,
  onUpdated,
}) => {
  const [expanded, setExpanded] = useState(false);
  const isVerified = !!evidence.verified_by_forensic_doctor;

  // Collect available images (image1, image2, image3)
  const images: string[] = [
    evidence.image1,
    evidence.image2,
    evidence.image3,
  ].filter(Boolean) as string[];

  return (
    <Card
      elevation={0}
      sx={{
        background: 'var(--glass-bg, rgba(255,255,255,0.04))',
        border: isVerified
          ? '1px solid rgba(76, 175, 80, 0.4)'
          : '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
        borderRadius: 3,
        transition: 'border-color 0.2s',
        '&:hover': {
          borderColor: isVerified
            ? 'rgba(76, 175, 80, 0.7)'
            : 'var(--color-accent-primary, rgba(100,180,255,0.5))',
        },
      }}
    >
      {/* First image as card media if present */}
      {images[0] && (
        <CardMedia
          component="img"
          height="160"
          image={images[0]}
          alt={evidence.title}
          sx={{ objectFit: 'cover', borderRadius: '12px 12px 0 0', opacity: 0.9 }}
        />
      )}

      <CardContent sx={{ p: 2.5 }}>
        {/* Header row */}
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={1}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {evidence.title}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'var(--text-secondary)', display: 'block', mt: 0.25 }}
            >
              Case: {evidence.case?.title ?? `#${evidence.case}`}
            </Typography>
          </Box>

          <Stack direction="row" spacing={0.75} flexShrink={0}>
            {evidence.evidence_category && (
              <Chip
                label={CATEGORY_LABELS[evidence.evidence_category] ?? evidence.evidence_category}
                size="small"
                color={CATEGORY_COLORS[evidence.evidence_category] ?? 'default'}
                sx={{ fontSize: '0.7rem', height: 22 }}
              />
            )}
            <Chip
              icon={
                isVerified ? (
                  <CheckCircleIcon sx={{ fontSize: '0.85rem !important' }} />
                ) : (
                  <PendingIcon sx={{ fontSize: '0.85rem !important' }} />
                )
              }
              label={isVerified ? 'Verified' : 'Pending'}
              size="small"
              color={isVerified ? 'success' : 'warning'}
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 22 }}
            />
          </Stack>
        </Stack>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            mt: 1.5,
            color: 'var(--text-secondary)',
            display: '-webkit-box',
            WebkitLineClamp: expanded ? 'unset' : 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {evidence.description}
        </Typography>

        {/* Expand / Collapse */}
        <Button
          size="small"
          endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          onClick={() => setExpanded((p) => !p)}
          sx={{
            mt: 0.5,
            p: 0,
            minWidth: 0,
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            textTransform: 'none',
            '&:hover': { background: 'transparent', color: 'var(--text-primary)' },
          }}
        >
          {expanded ? 'Show less' : 'Show more'}
        </Button>

        {/* Expanded details */}
        <Collapse in={expanded}>
          <Divider sx={{ my: 1.5, borderColor: 'var(--border-subtle)' }} />

          <Stack spacing={0.75}>
            <DetailRow label="Recorded by" value={evidence.recorded_by?.full_name ?? evidence.recorded_by?.username ?? '—'} />
            <DetailRow label="Recorded on" value={formatDate(evidence.created_date)} />

            {/* Extra images */}
            {images.length > 1 && (
              <Box>
                <Typography variant="caption" sx={{ color: 'var(--text-secondary)', mb: 0.5, display: 'block' }}>
                  Additional images
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {images.slice(1).map((src, idx) => (
                    <Box
                      key={idx}
                      component="img"
                      src={src}
                      alt={`evidence-img-${idx + 2}`}
                      sx={{
                        width: 72,
                        height: 72,
                        objectFit: 'cover',
                        borderRadius: 1,
                        border: '1px solid var(--border-subtle)',
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {/* Verification info (if already verified) */}
            {isVerified && (
              <>
                <Divider sx={{ borderColor: 'var(--border-subtle)', my: 0.5 }} />
                <DetailRow
                  label="Verified by"
                  value={
                    evidence.verified_by_forensic_doctor?.full_name ??
                    evidence.verified_by_forensic_doctor?.username ??
                    '—'
                  }
                />
                <DetailRow label="Verification date" value={formatDate(evidence.verification_date)} />
                {evidence.verification_notes && (
                  <Box>
                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                      Notes
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.25,
                        p: 1,
                        borderRadius: 1,
                        background: 'rgba(76,175,80,0.07)',
                        border: '1px solid rgba(76,175,80,0.2)',
                        fontSize: '0.82rem',
                        color: 'var(--text-primary)',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {evidence.verification_notes}
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Stack>
        </Collapse>

        <Divider sx={{ my: 1.5, borderColor: 'var(--border-subtle)' }} />

        {/* Annotation form */}
        <AnnotationForm evidence={evidence} onSaved={onUpdated} />
      </CardContent>
    </Card>
  );
};

// ─── Small helper ─────────────────────────────────────────────────────────────

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Stack direction="row" spacing={1} alignItems="baseline">
    <Typography variant="caption" sx={{ color: 'var(--text-secondary)', minWidth: 110 }}>
      {label}
    </Typography>
    <Typography variant="caption" sx={{ color: 'var(--text-primary)', fontWeight: 500 }}>
      {value}
    </Typography>
  </Stack>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export const ForensicDoctorDashboard: React.FC = () => {
  const [allBiological, setAllBiological] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Counters derived from state
  const verifiedCount = allBiological.filter(
    (e) => !!e.verified_by_forensic_doctor
  ).length;
  const pendingCount = allBiological.length - verifiedCount;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch ALL biological evidence (verified + unverified) via the type filter
      const response = await evidenceService.getEvidence({ evidence_type: 'biological' });
      // Handle both paginated and plain array responses
      const items = Array.isArray(response)
        ? response
        : (response as { results?: Evidence[] }).results ?? [];
      setAllBiological(items);
    } catch {
      setError('Failed to load biological evidence. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // When a card saves an annotation, update only that item in state
  const handleUpdated = useCallback((updated: Evidence) => {
    setAllBiological((prev) =>
      prev.map((e) => (e.id === updated.id ? updated : e))
    );
  }, []);

  return (
    <Box>
      {/* ── Section header ── */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
        <ScienceIcon sx={{ color: 'var(--color-accent-primary)', fontSize: 28 }} />
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            background: 'var(--gradient-accent)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Biological Evidence
        </Typography>
      </Stack>

      <Typography
        variant="body2"
        sx={{ color: 'var(--text-secondary)', mb: 3 }}
      >
        Review and annotate all biological evidence submitted to the system.
      </Typography>

      {/* ── Summary chips ── */}
      {!loading && !error && (
        <Stack direction="row" spacing={1.5} sx={{ mb: 3 }} flexWrap="wrap">
          <Chip
            icon={<ScienceIcon sx={{ fontSize: '1rem !important' }} />}
            label={`Total: ${allBiological.length}`}
            variant="outlined"
            sx={{ fontSize: '0.8rem' }}
          />
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: '1rem !important' }} />}
            label={`Verified: ${verifiedCount}`}
            color="success"
            variant="outlined"
            sx={{ fontSize: '0.8rem' }}
          />
          <Chip
            icon={<PendingIcon sx={{ fontSize: '1rem !important' }} />}
            label={`Pending: ${pendingCount}`}
            color="warning"
            variant="outlined"
            sx={{ fontSize: '0.8rem' }}
          />
        </Stack>
      )}

      {/* ── Loading ── */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: 'var(--color-accent-primary)' }} />
        </Box>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <Alert
          severity="error"
          action={
            <Button size="small" onClick={fetchAll}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && allBiological.length === 0 && (
        <Box
          sx={{
            py: 8,
            textAlign: 'center',
            border: '1px dashed var(--border-subtle)',
            borderRadius: 3,
          }}
        >
          <ScienceIcon sx={{ fontSize: 48, color: 'var(--text-secondary)', mb: 1 }} />
          <Typography variant="body1" sx={{ color: 'var(--text-secondary)' }}>
            No biological evidence found in the system.
          </Typography>
        </Box>
      )}

      {/* ── Evidence grid ── */}
      {!loading && !error && allBiological.length > 0 && (
        <Grid container spacing={2.5}>
          {allBiological.map((evidence) => (
            <Grid item xs={12} sm={6} md={4} key={evidence.id}>
              <BiologicalEvidenceCard
                evidence={evidence}
                onUpdated={handleUpdated}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};


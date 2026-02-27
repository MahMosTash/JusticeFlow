/**
 * Trial Page — Judge's full case dossier + verdict form
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container, Typography, Box, Card, CardContent, Grid, Chip, Button,
    Divider, Alert, TextField, FormControl, InputLabel, Select, MenuItem,
    Accordion, AccordionSummary, AccordionDetails, LinearProgress, Paper, Stack,
} from '@mui/material';
import {
    ExpandMore, Gavel, Assignment, CheckCircle, Cancel,
    ArrowBack, HowToVote,
} from '@mui/icons-material';
import { trialService } from '@/services/trialService';
import { Trial, TrialDossierCase } from '@/types/api';
import { formatDate, formatDateTime } from '@/utils/dateUtils';
import { useAuth } from '@/hooks/useAuth';
import { CardSkeleton } from '@/components/common/Skeleton';

export const TrialPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { hasRole } = useAuth();
    const isJudge = hasRole('Judge');

    const [trial, setTrial] = useState<Trial | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Verdict form
    const [verdict, setVerdict] = useState<'Guilty' | 'Not Guilty'>('Guilty');
    const [punishmentTitle, setPunishmentTitle] = useState('');
    const [punishmentDesc, setPunishmentDesc] = useState('');
    const [fineAmount, setFineAmount] = useState<number | ''>('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        if (id) loadTrial();
    }, [id]);

    const loadTrial = async () => {
        try {
            setLoading(true);
            const data = await trialService.getTrial(parseInt(id!));
            setTrial(data);
        } catch (e: any) {
            setError('Failed to load trial data.');
        } finally {
            setLoading(false);
        }
    };

    const handleRecordVerdict = async () => {
        if (!trial) return;
        setSubmitError(null);
        setSubmitting(true);
        try {
            const payload: any = { verdict, notes };
            if (verdict === 'Guilty') {
                payload.punishment_title = punishmentTitle;
                payload.punishment_description = punishmentDesc;
                if (fineAmount !== '' && fineAmount > 0) {
                    payload.fine_amount = fineAmount;
                }
            }
            const updated = await trialService.recordVerdict(trial.id, payload);
            setTrial(updated);
        } catch (e: any) {
            const d = e?.response?.data;
            if (typeof d === 'object' && !d?.detail) {
                setSubmitError(Object.values(d).flat().join(' '));
            } else {
                setSubmitError(d?.detail || d || 'Failed to record verdict.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Container sx={{ py: 4 }}><CardSkeleton /></Container>;
    if (error || !trial) return (
        <Container sx={{ py: 4 }}><Alert severity="error">{error || 'Trial not found.'}</Alert></Container>
    );

    const dossier = trial.case as TrialDossierCase;

    const severityColor = (s: string) =>
        s === 'Critical' ? 'error' : s === 'Level 3' ? 'warning' : 'info';

    const statusColor = (s: string) =>
        s === 'Resolved' ? 'success' : s === 'Open' ? 'primary' : 'default';

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* ── Header ── */}
            <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>Back</Button>
                <Typography variant="h4" component="h1" flexGrow={1}>
                    Trial — {dossier.title}
                </Typography>
                <Chip label={dossier.severity} color={severityColor(dossier.severity)} />
                <Chip label={dossier.status} color={statusColor(dossier.status)} />
            </Box>

            {/* ── Verdict banner (if complete) ── */}
            {trial.is_complete && (
                <Alert
                    severity={trial.verdict === 'Guilty' ? 'error' : 'success'}
                    icon={trial.verdict === 'Guilty' ? <Gavel /> : <CheckCircle />}
                    sx={{ mb: 3, fontSize: '1rem', fontWeight: 600 }}
                >
                    Verdict: <strong>{trial.verdict}</strong>
                    {trial.punishment_title && ` — ${trial.punishment_title}`}
                    {trial.verdict_date && ` (${formatDateTime(trial.verdict_date)})`}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* ════════════════════════════════════════
            LEFT COLUMN — Case Dossier
            ════════════════════════════════════════ */}
                <Grid item xs={12} lg={8}>

                    {/* ── Case Overview ── */}
                    <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                                <Assignment fontSize="small" /> Case Overview
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>{dossier.description}</Typography>
                            <Grid container spacing={2}>
                                {dossier.incident_date && (
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="caption" color="text.secondary">Incident Date</Typography>
                                        <Typography variant="body2">{formatDate(dossier.incident_date)}</Typography>
                                    </Grid>
                                )}
                                {dossier.incident_location && (
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="caption" color="text.secondary">Location</Typography>
                                        <Typography variant="body2">{dossier.incident_location}</Typography>
                                    </Grid>
                                )}
                                <Grid item xs={12} sm={4}>
                                    <Typography variant="caption" color="text.secondary">Opened</Typography>
                                    <Typography variant="body2">{formatDate(dossier.created_date)}</Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* ── Police Members Involved ── */}
                    <Accordion defaultExpanded sx={{ mb: 1 }}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography fontWeight={600}>Police Members Involved</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                {[
                                    { label: 'Created By', user: dossier.created_by },
                                    { label: 'Assigned Detective', user: dossier.assigned_detective },
                                    { label: 'Assigned Sergeant', user: dossier.assigned_sergeant },
                                    { label: 'Presiding Judge', user: trial.judge },
                                ].map(({ label, user }) => user && (
                                    <Grid item xs={12} sm={6} key={label}>
                                        <Paper variant="outlined" sx={{ p: 1.5 }}>
                                            <Typography variant="caption" color="text.secondary">{label}</Typography>
                                            <Typography variant="body2" fontWeight={600}>
                                                {(user as any).full_name || (user as any).username}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {(user as any).roles?.map((r: any) => r.name).join(', ')}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </AccordionDetails>
                    </Accordion>

                    {/* ── Suspects ── */}
                    <Accordion defaultExpanded sx={{ mb: 1 }}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography fontWeight={600}>
                                Suspects ({dossier.suspects?.length ?? 0})
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {!dossier.suspects?.length ? (
                                <Typography color="text.secondary">No suspects recorded.</Typography>
                            ) : (
                                <Grid container spacing={2}>
                                    {dossier.suspects.map((s) => (
                                        <Grid item xs={12} sm={6} key={s.id}>
                                            <Paper variant="outlined" sx={{ p: 1.5 }}>
                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <Typography fontWeight={600}>{s.name}</Typography>
                                                    <Chip label={s.status} size="small"
                                                        color={s.status === 'Arrested' ? 'error' : s.status === 'Cleared' ? 'success' : 'default'} />
                                                </Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    National ID: {s.national_id} · Phone: {s.phone_number}
                                                </Typography>
                                                {s.notes && <Typography variant="body2" sx={{ mt: 1 }}>{s.notes}</Typography>}
                                                {s.arrest_date && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        Arrested: {formatDate(s.arrest_date)}
                                                    </Typography>
                                                )}
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </AccordionDetails>
                    </Accordion>

                    {/* ── Guilt Scores ── */}
                    <Accordion sx={{ mb: 1 }}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography fontWeight={600}>
                                Guilt Scores ({dossier.guilt_scores?.length ?? 0})
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {!dossier.guilt_scores?.length ? (
                                <Typography color="text.secondary">No guilt scores submitted.</Typography>
                            ) : (
                                <Stack spacing={1}>
                                    {dossier.guilt_scores.map((gs) => (
                                        <Paper variant="outlined" sx={{ p: 1.5 }} key={gs.id}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Typography variant="body2">
                                                    <strong>{gs.assigned_by?.full_name || gs.assigned_by?.username}</strong> for{' '}
                                                    <em>{gs.suspect?.name}</em>
                                                </Typography>
                                                <Chip
                                                    label={`${gs.score} / 10`}
                                                    size="small"
                                                    color={gs.score >= 7 ? 'error' : gs.score >= 4 ? 'warning' : 'success'}
                                                />
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">{gs.justification}</Typography>
                                        </Paper>
                                    ))}
                                </Stack>
                            )}
                        </AccordionDetails>
                    </Accordion>

                    {/* ── Captain Decisions ── */}
                    <Accordion sx={{ mb: 1 }}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography fontWeight={600}>
                                Captain Decisions ({dossier.captain_decisions?.length ?? 0})
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {!dossier.captain_decisions?.length ? (
                                <Typography color="text.secondary">No captain decisions recorded.</Typography>
                            ) : (
                                <Stack spacing={1}>
                                    {dossier.captain_decisions.map((d) => (
                                        <Paper variant="outlined" sx={{ p: 1.5 }} key={d.id}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Typography fontWeight={600}>{d.decision}</Typography>
                                                {d.requires_chief_approval && (
                                                    <Chip
                                                        size="small"
                                                        label={d.chief_approval === true ? '✅ Chief Approved' : d.chief_approval === false ? '❌ Chief Rejected' : '⏳ Awaiting Chief'}
                                                        color={d.chief_approval === true ? 'success' : d.chief_approval === false ? 'error' : 'warning'}
                                                    />
                                                )}
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">
                                                By {d.decided_by?.full_name || d.decided_by?.username} for {d.suspect?.name}
                                            </Typography>
                                            {d.comments && <Typography variant="body2" sx={{ mt: 0.5 }}>{d.comments}</Typography>}
                                        </Paper>
                                    ))}
                                </Stack>
                            )}
                        </AccordionDetails>
                    </Accordion>

                    {/* ── Evidence ── */}
                    <Accordion sx={{ mb: 1 }}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography fontWeight={600}>
                                Evidence ({dossier.evidence_items?.length ?? 0})
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {!dossier.evidence_items?.length ? (
                                <Typography color="text.secondary">No evidence recorded.</Typography>
                            ) : (
                                <Grid container spacing={1}>
                                    {dossier.evidence_items.map((ev) => (
                                        <Grid item xs={12} sm={6} key={ev.id}>
                                            <Paper variant="outlined" sx={{ p: 1.5 }}>
                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <Typography fontWeight={600}>{ev.title}</Typography>
                                                    <Chip label={ev.evidence_type.replace('_', ' ')} size="small" variant="outlined" />
                                                </Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    By {ev.recorded_by?.full_name || ev.recorded_by?.username} · {formatDate(ev.created_date)}
                                                </Typography>
                                                {ev.description && <Typography variant="body2" sx={{ mt: 0.5 }}>{ev.description}</Typography>}
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </AccordionDetails>
                    </Accordion>

                    {/* ── Complaints ── */}
                    <Accordion sx={{ mb: 1 }}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography fontWeight={600}>
                                Complaints &amp; Complainants ({dossier.complaints?.length ?? 0})
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {!dossier.complaints?.length ? (
                                <Typography color="text.secondary">No linked complaints.</Typography>
                            ) : (
                                <Stack spacing={1}>
                                    {dossier.complaints.map((c) => (
                                        <Paper variant="outlined" sx={{ p: 1.5 }} key={c.id}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Typography fontWeight={600}>{c.title}</Typography>
                                                <Chip label={c.status} size="small" />
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">
                                                By {c.submitted_by?.full_name || c.submitted_by?.username} · {formatDate(c.created_date)}
                                            </Typography>
                                            <Typography variant="body2" sx={{ mt: 0.5 }}>{c.description}</Typography>
                                        </Paper>
                                    ))}
                                </Stack>
                            )}
                            {dossier.witnesses?.length > 0 && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle2" gutterBottom>Witnesses</Typography>
                                    <Stack spacing={1}>
                                        {dossier.witnesses.map((w) => (
                                            <Paper variant="outlined" sx={{ p: 1.5 }} key={w.id}>
                                                <Typography variant="body2">
                                                    {w.witness_name || '(Anonymous)'} · {w.witness_national_id} · {w.witness_phone}
                                                </Typography>
                                                {w.notes && <Typography variant="caption" color="text.secondary">{w.notes}</Typography>}
                                            </Paper>
                                        ))}
                                    </Stack>
                                </>
                            )}
                        </AccordionDetails>
                    </Accordion>

                </Grid>

                {/* ════════════════════════════════════════
            RIGHT COLUMN — Verdict Form
            ════════════════════════════════════════ */}
                <Grid item xs={12} lg={4}>
                    <Box position="sticky" top={80}>
                        {/* Trial meta */}
                        <Card variant="outlined" sx={{ mb: 2 }}>
                            <CardContent>
                                <Typography variant="subtitle2" color="text.secondary">Trial ID</Typography>
                                <Typography>#{trial.id}</Typography>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>Judge</Typography>
                                <Typography>{(trial.judge as any)?.full_name || (trial.judge as any)?.username}</Typography>
                                {trial.trial_date && (
                                    <>
                                        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>Trial Date</Typography>
                                        <Typography>{formatDateTime(trial.trial_date)}</Typography>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Verdict form */}
                        {isJudge && !trial.is_complete && (
                            <Card variant="outlined" sx={{ border: '2px solid', borderColor: 'primary.main' }}>
                                <CardContent>
                                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                                        <HowToVote color="primary" />
                                        <Typography variant="h6">Record Verdict</Typography>
                                    </Box>

                                    {submitError && (
                                        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSubmitError(null)}>
                                            {submitError}
                                        </Alert>
                                    )}

                                    <Stack spacing={2}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Verdict</InputLabel>
                                            <Select
                                                id="verdict-select"
                                                value={verdict}
                                                label="Verdict"
                                                onChange={(e) => setVerdict(e.target.value as any)}
                                            >
                                                <MenuItem value="Guilty">Guilty</MenuItem>
                                                <MenuItem value="Not Guilty">Not Guilty</MenuItem>
                                            </Select>
                                        </FormControl>

                                        {verdict === 'Guilty' && (
                                            <>
                                                <TextField
                                                    id="punishment-title"
                                                    label="Punishment Title *"
                                                    size="small"
                                                    fullWidth
                                                    value={punishmentTitle}
                                                    onChange={(e) => setPunishmentTitle(e.target.value)}
                                                    placeholder="e.g. 5 Years Imprisonment"
                                                />
                                                <TextField
                                                    id="punishment-description"
                                                    label="Punishment Description *"
                                                    size="small"
                                                    fullWidth
                                                    multiline
                                                    rows={3}
                                                    value={punishmentDesc}
                                                    onChange={(e) => setPunishmentDesc(e.target.value)}
                                                    placeholder="Detailed sentence and reasoning..."
                                                />
                                                <TextField
                                                    id="fine-amount"
                                                    label="Fine Amount (IRR)"
                                                    size="small"
                                                    fullWidth
                                                    type="number"
                                                    value={fineAmount}
                                                    onChange={(e) => setFineAmount(e.target.value === '' ? '' : Number(e.target.value))}
                                                    placeholder="e.g. 5000000"
                                                    helperText="Optional. Amount in Rials. Only applicable to Level 2 and 3 crimes."
                                                />
                                            </>
                                        )}

                                        <TextField
                                            id="verdict-notes"
                                            label="Additional Notes"
                                            size="small"
                                            fullWidth
                                            multiline
                                            rows={2}
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />

                                        {submitting && <LinearProgress />}

                                        <Button
                                            id="submit-verdict-btn"
                                            variant="contained"
                                            color={verdict === 'Guilty' ? 'error' : 'success'}
                                            startIcon={verdict === 'Guilty' ? <Gavel /> : <CheckCircle />}
                                            disabled={
                                                submitting ||
                                                (verdict === 'Guilty' && (!punishmentTitle.trim() || !punishmentDesc.trim()))
                                            }
                                            onClick={handleRecordVerdict}
                                            fullWidth
                                        >
                                            {submitting ? 'Recording...' : `Record: ${verdict}`}
                                        </Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        )}

                        {/* Completed verdict summary */}
                        {trial.is_complete && (
                            <Card variant="outlined" sx={{ border: '2px solid', borderColor: trial.verdict === 'Guilty' ? 'error.main' : 'success.main' }}>
                                <CardContent>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        {trial.verdict === 'Guilty' ? <Cancel color="error" /> : <CheckCircle color="success" />}
                                        <Typography variant="h6" color={trial.verdict === 'Guilty' ? 'error' : 'success'}>
                                            {trial.verdict}
                                        </Typography>
                                    </Box>
                                    {trial.punishment_title && (
                                        <>
                                            <Typography variant="subtitle2">Punishment</Typography>
                                            <Typography variant="body2" fontWeight={600}>{trial.punishment_title}</Typography>
                                            <Typography variant="body2" color="text.secondary">{trial.punishment_description}</Typography>
                                        </>
                                    )}
                                    {trial.notes && (
                                        <>
                                            <Divider sx={{ my: 1 }} />
                                            <Typography variant="caption" color="text.secondary">{trial.notes}</Typography>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
};

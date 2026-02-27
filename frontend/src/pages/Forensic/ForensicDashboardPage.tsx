import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Container,
    Paper,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Button,
    TextField,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    CircularProgress,
} from '@mui/material';
import { Science, CheckCircle, Cancel } from '@mui/icons-material';
import { evidenceService } from '@/services/evidenceService';
import { Evidence } from '@/types/api';
import { formatDateTime } from '@/utils/dateUtils';

export const ForensicDashboardPage: React.FC = () => {
    const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
    const [notes, setNotes] = useState('');
    const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
    const [actionType, setActionType] = useState<'valid' | 'invalid' | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchPendingEvidence = async () => {
        try {
            setLoading(true);
            setError(null);
            // Fetch only unverified biological evidence
            const response = await evidenceService.getEvidence({
                evidence_type: 'biological',
                verified: false,
                detailed: true,
            });
            setEvidenceList(response.results);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to load pending evidence.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingEvidence();
    }, []);

    const handleOpenDialog = (evidence: Evidence, type: 'valid' | 'invalid') => {
        setSelectedEvidence(evidence);
        setActionType(type);
        setNotes('');
        setVerifyDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setVerifyDialogOpen(false);
        setSelectedEvidence(null);
        setActionType(null);
        setNotes('');
    };

    const handleSubmitVerification = async () => {
        if (!selectedEvidence || !actionType) return;

        try {
            setSubmitting(true);
            await evidenceService.verifyEvidence(selectedEvidence.id, {
                is_valid: actionType === 'valid',
                verification_notes: notes
            });

            // Remove from list
            setEvidenceList(prev => prev.filter(e => e.id !== selectedEvidence.id));
            handleCloseDialog();
        } catch (err: any) {
            console.error('Failed to verify evidence:', err);
            // Show error in dialog or somehow
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box display="flex" alignItems="center" mb={4}>
                    <Science sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                    <Typography variant="h4" sx={{ color: 'var(--text-primary)' }}>
                        Lab &amp; Forensics Dashboard
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Paper
                    sx={{
                        p: 3,
                        mb: 4,
                        background: 'var(--background-paper)',
                        border: '1px solid var(--border-color)'
                    }}
                >
                    <Typography variant="h6" mb={2}>Pending Biological Evidence Queue</Typography>

                    {evidenceList.length === 0 ? (
                        <Alert severity="info" variant="outlined">
                            There is no pending biological evidence requiring verification at this time.
                        </Alert>
                    ) : (
                        <Grid container spacing={3}>
                            {evidenceList.map((evidence) => (
                                <Grid item xs={12} md={6} key={evidence.id}>
                                    <Card
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            height: '100%',
                                            background: 'rgba(36, 31, 31, 0.4)',
                                            borderColor: 'rgba(184, 134, 11, 0.2)'
                                        }}
                                    >
                                        {/* Only show image1 as it is required for biological evidence */}
                                        {evidence.image1 && (
                                            <CardMedia
                                                component="img"
                                                height="200"
                                                image={evidence.image1}
                                                alt={evidence.title}
                                                sx={{ objectFit: 'cover' }}
                                            />
                                        )}
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                                <Typography variant="h6" noWrap title={evidence.title}>
                                                    {evidence.title}
                                                </Typography>
                                                <Chip
                                                    label={evidence.evidence_category || 'Biological'}
                                                    size="small"
                                                    color="secondary"
                                                />
                                            </Box>

                                            <Typography variant="body2" color="text.secondary" paragraph>
                                                {evidence.description}
                                            </Typography>

                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="caption" display="block" color="text.secondary">
                                                    <strong>Case:</strong> #{(evidence.case as any)?.id || evidence.case} - {(evidence.case as any)?.title || ''}
                                                </Typography>
                                                <Typography variant="caption" display="block" color="text.secondary">
                                                    <strong>Recorded by:</strong> {evidence.recorded_by?.full_name} on {formatDateTime(evidence.created_date)}
                                                </Typography>
                                            </Box>

                                            <Box display="flex" gap={2} mt="auto" pt={2}>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    startIcon={<CheckCircle />}
                                                    fullWidth
                                                    onClick={() => handleOpenDialog(evidence, 'valid')}
                                                >
                                                    Valid
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    startIcon={<Cancel />}
                                                    fullWidth
                                                    onClick={() => handleOpenDialog(evidence, 'invalid')}
                                                >
                                                    Invalid
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Paper>
            </Container>

            {/* Verification Dialog */}
            <Dialog open={verifyDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Mark Evidence as {actionType === 'valid' ? 'Valid' : 'Invalid'}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" paragraph>
                        You are about to mark "{selectedEvidence?.title}" for Case #{(selectedEvidence?.case as any)?.id || selectedEvidence?.case} as <strong>{actionType === 'valid' ? 'Valid (Genuine)' : 'Invalid (Fake)'}</strong>.
                        This action will automatically notify the assigned detective.
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="notes"
                        label="Forensic Notes / Reasoning"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        required
                        placeholder="Please detail your scientific findings..."
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseDialog} disabled={submitting}>Cancel</Button>
                    <Button
                        onClick={handleSubmitVerification}
                        variant="contained"
                        color={actionType === 'valid' ? 'success' : 'error'}
                        disabled={submitting || !notes.trim()}
                    >
                        {submitting ? 'Submitting...' : 'Confirm'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

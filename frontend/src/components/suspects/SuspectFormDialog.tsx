import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Alert,
} from '@mui/material';
import { suspectService } from '@/services/suspectService';
import { Suspect } from '@/types/api';

interface SuspectFormDialogProps {
    open: boolean;
    onClose: () => void;
    caseId: number;
    onSuspectAdded: (suspect: Suspect) => void;
}

export const SuspectFormDialog: React.FC<SuspectFormDialogProps> = ({
    open,
    onClose,
    caseId,
    onSuspectAdded,
}) => {
    const [formData, setFormData] = useState({
        name: '',
        national_id: '',
        phone_number: '',
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.national_id.trim()) {
            setError('Name and National ID are required.');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const newSuspect = await suspectService.createSuspect({
                ...formData,
                case: caseId,
                status: 'Under Investigation',
            });
            onSuspectAdded(newSuspect);
            setFormData({ name: '', national_id: '', phone_number: '', notes: '' });
            onClose();
        } catch (err: any) {
            console.error('Failed to create suspect:', err);
            const errorMessage = err.response?.data;
            if (errorMessage && typeof errorMessage === 'object' && !errorMessage.detail) {
                const firstError = Object.values(errorMessage)[0];
                setError(Array.isArray(firstError) ? firstError[0] : String(firstError));
            } else {
                setError(err.response?.data?.detail || err.message || 'Failed to create suspect');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={() => !loading && onClose()} maxWidth="sm" fullWidth>
            <DialogTitle>Add Suspect to Case</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
                        {error}
                    </Alert>
                )}
                <form id="suspect-form" onSubmit={handleSubmit}>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="National ID"
                                name="national_id"
                                value={formData.national_id}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Phone Number"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Description, alias, reasons for suspicion..."
                            />
                        </Grid>
                    </Grid>
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    form="suspect-form"
                    variant="contained"
                    disabled={loading || !formData.name.trim() || !formData.national_id.trim()}
                >
                    {loading ? 'Adding...' : 'Add Suspect'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

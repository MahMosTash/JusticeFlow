import { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Alert
} from '@mui/material';
import { roleService } from '@/services/roleService';
import { Role } from '@/types/api';

export const RoleManagementPage = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [openModal, setOpenModal] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [newRoleDesc, setNewRoleDesc] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchRoles = async () => {
        try {
            setIsLoading(true);
            const data = await roleService.getRoles();
            setRoles(data);
            setError(null);
        } catch (err: any) {
            setError('Failed to load roles.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleCreateRole = async () => {
        if (!newRoleName.trim()) return;
        try {
            setIsSubmitting(true);
            await roleService.createRole({ name: newRoleName, description: newRoleDesc });
            await fetchRoles(); // Refresh data
            setOpenModal(false);
            setNewRoleName('');
            setNewRoleDesc('');
        } catch (err: any) {
            alert('Failed to create role. It may already exist.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteRole = async (roleId: number) => {
        if (!window.confirm('Are you sure you want to delete this role? This cannot be undone.')) return;
        try {
            await roleService.deleteRole(roleId);
            await fetchRoles();
        } catch (err: any) {
            alert('Failed to delete role.');
        }
    };

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">
                    Manage Roles
                </Typography>
                <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>
                    Create New Role
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Role Name</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {roles.map((role) => (
                            <TableRow key={role.id}>
                                <TableCell><b>{role.name}</b></TableCell>
                                <TableCell>{role.description || 'No description'}</TableCell>
                                <TableCell align="right">
                                    <Button variant="outlined" color="error" size="small" onClick={() => handleDeleteRole(role.id)}>
                                        Delete Role
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {roles.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} align="center">No roles found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create Role Modal */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Role Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        sx={{ mb: 2, mt: 1 }}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        type="text"
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        value={newRoleDesc}
                        onChange={(e) => setNewRoleDesc(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)}>Cancel</Button>
                    <Button
                        onClick={handleCreateRole}
                        variant="contained"
                        disabled={!newRoleName.trim() || isSubmitting}
                    >
                        {isSubmitting ? 'Creating...' : 'Create Role'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

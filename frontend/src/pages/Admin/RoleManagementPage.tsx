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

    if (isLoading) return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'var(--gradient-page-bg)',
            }}
        >
            <CircularProgress sx={{ color: 'var(--accent-primary)' }} />
        </Box>
    );

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'var(--gradient-page-bg)',
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'var(--radial-glow-combined)',
                    pointerEvents: 'none',
                    zIndex: 0,
                },
            }}
        >
            <Container maxWidth="md" sx={{ py: 6, position: 'relative', zIndex: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography
                        variant="h1"
                        component="h1"
                        sx={{
                            fontSize: 'var(--heading-h1-size)',
                            fontWeight: 'var(--heading-h1-weight)',
                            lineHeight: 'var(--heading-h1-line-height)',
                            letterSpacing: 'var(--heading-h1-letter-spacing)',
                            background: 'var(--gradient-accent)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        Manage Roles
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setOpenModal(true)}
                        sx={{
                            background: 'var(--gradient-accent)',
                            color: 'var(--text-primary)',
                            boxShadow: 'var(--button-shadow)',
                            borderRadius: 'var(--radius-md)',
                            px: 3,
                            py: 1.5,
                            fontWeight: 'var(--font-weight-semibold)',
                            textTransform: 'none',
                            fontSize: 'var(--button-base-size)',
                            '&:hover': {
                                background: 'var(--gradient-accent-hover)',
                                boxShadow: 'var(--button-shadow-hover)',
                                transform: 'translateY(-2px)',
                            },
                            transition: 'var(--transition-base)',
                        }}
                    >
                        Create New Role
                    </Button>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <TableContainer
                    component={Paper}
                    className="glass-effect"
                    sx={{
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-lg)',
                        overflow: 'hidden',
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow
                                sx={{
                                    background: 'var(--bg-elevated)',
                                    '& th': {
                                        color: 'var(--text-primary)',
                                        fontWeight: 'var(--font-weight-semibold)',
                                        fontSize: 'var(--label-base-size)',
                                        borderBottom: '1px solid var(--glass-border)',
                                    },
                                }}
                            >
                                <TableCell>Role Name</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {roles.map((role) => (
                                <TableRow
                                    key={role.id}
                                    hover
                                    sx={{
                                        '&:hover': {
                                            background: 'var(--bg-hover)',
                                        },
                                        '& td': {
                                            color: 'var(--text-primary)',
                                            borderBottom: '1px solid var(--glass-border)',
                                            fontSize: 'var(--body-base-size)',
                                        },
                                    }}
                                >
                                    <TableCell>
                                        <Typography
                                            sx={{
                                                fontWeight: 'var(--font-weight-semibold)',
                                                fontSize: 'var(--body-base-size)',
                                                color: 'var(--text-primary)',
                                            }}
                                        >
                                            {role.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {role.description || (
                                            <Typography
                                                sx={{
                                                    color: 'var(--text-secondary)',
                                                    fontSize: 'var(--body-base-size)',
                                                }}
                                            >
                                                No description
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            onClick={() => handleDeleteRole(role.id)}
                                            sx={{
                                                borderColor: 'var(--accent-error)',
                                                color: 'var(--accent-error)',
                                                '&:hover': {
                                                    borderColor: 'var(--accent-error)',
                                                    background: 'var(--error-bg)',
                                                },
                                            }}
                                        >
                                            Delete Role
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {roles.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        align="center"
                                        sx={{
                                            py: 4,
                                            color: 'var(--text-secondary)',
                                            fontSize: 'var(--body-base-size)',
                                        }}
                                    >
                                        No roles found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Create Role Modal */}
                <Dialog
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: 'var(--radius-lg)',
                            boxShadow: 'var(--shadow-xl)',
                        },
                    }}
                >
                    <DialogTitle
                        sx={{
                            fontSize: 'var(--heading-h3-size)',
                            fontWeight: 'var(--heading-h3-weight)',
                            color: 'var(--text-primary)',
                            borderBottom: '1px solid var(--glass-border)',
                        }}
                    >
                        Create New Role
                    </DialogTitle>
                    <DialogContent sx={{ mt: 2 }}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Role Name"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={newRoleName}
                            onChange={(e) => setNewRoleName(e.target.value)}
                            sx={{
                                mb: 2,
                                mt: 1,
                                '& .MuiOutlinedInput-root': {
                                    background: 'var(--input-bg)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--text-primary)',
                                    '& fieldset': {
                                        borderColor: 'var(--glass-border)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'var(--accent-primary)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'var(--accent-primary)',
                                        boxShadow: 'var(--shadow-glow)',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'var(--text-secondary)',
                                    '&.Mui-focused': {
                                        color: 'var(--accent-primary)',
                                    },
                                },
                            }}
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
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    background: 'var(--input-bg)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--text-primary)',
                                    '& fieldset': {
                                        borderColor: 'var(--glass-border)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'var(--accent-primary)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'var(--accent-primary)',
                                        boxShadow: 'var(--shadow-glow)',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'var(--text-secondary)',
                                    '&.Mui-focused': {
                                        color: 'var(--accent-primary)',
                                    },
                                },
                            }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2, borderTop: '1px solid var(--glass-border)' }}>
                        <Button
                            onClick={() => setOpenModal(false)}
                            sx={{
                                color: 'var(--text-secondary)',
                                '&:hover': {
                                    color: 'var(--accent-primary)',
                                    background: 'var(--accent-primary-light)',
                                },
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateRole}
                            variant="contained"
                            disabled={!newRoleName.trim() || isSubmitting}
                            sx={{
                                background: 'var(--gradient-accent)',
                                color: 'var(--text-primary)',
                                boxShadow: 'var(--button-shadow)',
                                '&:hover': {
                                    background: 'var(--gradient-accent-hover)',
                                    boxShadow: 'var(--button-shadow-hover)',
                                },
                                '&:disabled': {
                                    opacity: 0.6,
                                },
                            }}
                        >
                            {isSubmitting ? 'Creating...' : 'Create Role'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

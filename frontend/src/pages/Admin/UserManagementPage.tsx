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
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert
} from '@mui/material';
import { userService } from '@/services/userService';
import { roleService } from '@/services/roleService';
import { User, Role } from '@/types/api';

export const UserManagementPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [openModal, setOpenModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedRoleId, setSelectedRoleId] = useState<number | ''>('');
    const [isAssigning, setIsAssigning] = useState(false);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [usersData, rolesData] = await Promise.all([
                userService.getUsers(),
                roleService.getRoles()
            ]);
            setUsers(usersData);
            setRoles(rolesData);
            setError(null);
        } catch (err: any) {
            setError('Failed to load users and roles.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenAssign = (user: User) => {
        setSelectedUser(user);
        setSelectedRoleId('');
        setOpenModal(true);
    };

    const handleCloseAssign = () => {
        setOpenModal(false);
        setSelectedUser(null);
        setSelectedRoleId('');
    };

    const handleAssignRole = async () => {
        if (!selectedUser || selectedRoleId === '') return;
        try {
            setIsAssigning(true);
            await userService.assignRole(selectedUser.id, selectedRoleId as number);
            await fetchData(); // Refresh data
            handleCloseAssign();
        } catch (err: any) {
            alert('Failed to assign role.');
        } finally {
            setIsAssigning(false);
        }
    };

    const handleRemoveRole = async (userId: number, roleId: number) => {
        if (!window.confirm('Are you sure you want to remove this role?')) return;
        try {
            await userService.removeRole(userId, roleId);
            await fetchData();
        } catch (err: any) {
            alert('Failed to remove role.');
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
            <Container maxWidth="lg" sx={{ py: 6, position: 'relative', zIndex: 1 }}>
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
                        mb: 4,
                    }}
                >
                    Manage Users & Roles
                </Typography>

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
                                <TableCell>Username</TableCell>
                                <TableCell>Full Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>National ID</TableCell>
                                <TableCell>Current Roles</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow
                                    key={user.id}
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
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell>{user.first_name} {user.last_name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.national_id}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                            {user.roles.map((r) => (
                                                <Chip
                                                    key={r.id}
                                                    label={r.name}
                                                    size="small"
                                                    color="primary"
                                                    onDelete={() => handleRemoveRole(user.id, r.id)}
                                                    sx={{
                                                        fontWeight: 'var(--font-weight-medium)',
                                                        fontSize: 'var(--label-small-size)',
                                                    }}
                                                />
                                            ))}
                                            {user.roles.length === 0 && (
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: 'var(--text-secondary)',
                                                        fontSize: 'var(--caption-size)',
                                                    }}
                                                >
                                                    No roles
                                                </Typography>
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => handleOpenAssign(user)}
                                            sx={{
                                                borderColor: 'var(--glass-border)',
                                                color: 'var(--text-secondary)',
                                                '&:hover': {
                                                    borderColor: 'var(--accent-primary)',
                                                    color: 'var(--accent-primary)',
                                                    background: 'var(--accent-primary-light)',
                                                },
                                            }}
                                        >
                                            Assign Role
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {users.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        align="center"
                                        sx={{
                                            py: 4,
                                            color: 'var(--text-secondary)',
                                            fontSize: 'var(--body-base-size)',
                                        }}
                                    >
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Assign Role Modal */}
                <Dialog
                    open={openModal}
                    onClose={handleCloseAssign}
                    maxWidth="xs"
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
                        Assign Role to {selectedUser?.username}
                    </DialogTitle>
                    <DialogContent sx={{ mt: 2 }}>
                        <FormControl
                            fullWidth
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
                        >
                            <InputLabel>Select Role</InputLabel>
                            <Select
                                value={selectedRoleId}
                                label="Select Role"
                                onChange={(e) => setSelectedRoleId(e.target.value as number)}
                            >
                                {roles.map((role) => (
                                    <MenuItem key={role.id} value={role.id}>
                                        {role.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, borderTop: '1px solid var(--glass-border)' }}>
                        <Button
                            onClick={handleCloseAssign}
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
                            onClick={handleAssignRole}
                            variant="contained"
                            disabled={selectedRoleId === '' || isAssigning}
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
                            {isAssigning ? 'Assigning...' : 'Assign Role'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

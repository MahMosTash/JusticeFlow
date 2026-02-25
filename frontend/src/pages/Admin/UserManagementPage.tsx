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

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Manage Users & Roles
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
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
                            <TableRow key={user.id}>
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
                                            />
                                        ))}
                                        {user.roles.length === 0 && <Typography variant="caption" color="text.secondary">No roles</Typography>}
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    <Button variant="outlined" size="small" onClick={() => handleOpenAssign(user)}>
                                        Assign Role
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {users.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">No users found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Assign Role Modal */}
            <Dialog open={openModal} onClose={handleCloseAssign} maxWidth="xs" fullWidth>
                <DialogTitle>Assign Role to {selectedUser?.username}</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
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
                <DialogActions>
                    <Button onClick={handleCloseAssign}>Cancel</Button>
                    <Button
                        onClick={handleAssignRole}
                        variant="contained"
                        disabled={selectedRoleId === '' || isAssigning}
                    >
                        {isAssigning ? 'Assigning...' : 'Assign Role'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

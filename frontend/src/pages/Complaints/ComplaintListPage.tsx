/**
 * Complaint list page
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add, Visibility } from '@mui/icons-material';
import { complaintService } from '@/services/complaintService';
import { Complaint } from '@/types/api';
import { TableSkeleton } from '@/components/common/Skeleton';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/utils/dateUtils';

export const ComplaintListPage: React.FC = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadComplaints();
  }, [page, pageSize, statusFilter]);

  const loadComplaints = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: page + 1,
        page_size: pageSize,
      };
      if (statusFilter) params.status = statusFilter;

      const response = await complaintService.getComplaints(params);
      setComplaints(response.results);
      setTotalCount(response.count);
    } catch (err: any) {
      console.error('Failed to load complaints:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Rejected':
      case 'Permanently Rejected':
        return 'error';
      case 'Under Review':
        return 'info';
      default:
        return 'default';
    }
  };

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
      <Container maxWidth="xl" sx={{ py: 6, position: 'relative', zIndex: 1 }}>
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
            Complaints
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate(ROUTES.COMPLAINT_SUBMIT)}
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
            Submit Complaint
          </Button>
        </Box>

        <Box mb={3}>
          <FormControl
            size="small"
            sx={{
              minWidth: 150,
              '& .MuiOutlinedInput-root': {
                background: 'var(--input-bg)',
                borderRadius: 'var(--radius-md)',
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
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Under Review">Under Review</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
              <MenuItem value="Permanently Rejected">Permanently Rejected</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {isLoading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : (
          <>
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
                    <TableCell>ID</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Submission Count</TableCell>
                    <TableCell>Submitted By</TableCell>
                    <TableCell>Created Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {complaints.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography
                          sx={{
                            color: 'var(--text-secondary)',
                            fontSize: 'var(--body-base-size)',
                          }}
                        >
                          No complaints found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    complaints.map((complaint) => (
                      <TableRow
                        key={complaint.id}
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
                        <TableCell>{complaint.id}</TableCell>
                        <TableCell>{complaint.title}</TableCell>
                        <TableCell>
                          <Chip
                            label={complaint.status}
                            color={getStatusColor(complaint.status)}
                            size="small"
                            sx={{
                              fontWeight: 'var(--font-weight-medium)',
                              fontSize: 'var(--label-small-size)',
                            }}
                          />
                        </TableCell>
                        <TableCell>{complaint.submission_count}</TableCell>
                        <TableCell>
                          {complaint.submitted_by?.full_name || complaint.submitted_by?.username}
                        </TableCell>
                        <TableCell>{formatDate(complaint.created_date)}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => navigate(ROUTES.COMPLAINT_DETAIL(complaint.id))}
                            sx={{
                              color: 'var(--accent-primary)',
                              '&:hover': {
                                background: 'var(--accent-primary-light)',
                                color: 'var(--accent-primary-hover)',
                              },
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={pageSize}
              onRowsPerPageChange={(e) => {
                setPageSize(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 20, 50]}
              sx={{
                color: 'var(--text-primary)',
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  color: 'var(--text-primary)',
                  fontSize: 'var(--body-base-size)',
                },
                '& .MuiIconButton-root': {
                  color: 'var(--accent-primary)',
                  '&:hover': {
                    background: 'var(--accent-primary-light)',
                  },
                },
              }}
            />
          </>
        )}
      </Container>
    </Box>
  );
};


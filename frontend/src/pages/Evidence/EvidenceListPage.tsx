/**
 * Evidence list page
 */
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
} from '@mui/material';
import { Add, Visibility } from '@mui/icons-material';
import { evidenceService } from '@/services/evidenceService';
import { Evidence } from '@/types/api';
import { TableSkeleton } from '@/components/common/Skeleton';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/utils/dateUtils';

export const EvidenceListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const caseId = searchParams.get('case');
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadEvidence();
  }, [page, pageSize, caseId]);

  const loadEvidence = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: page + 1,
        page_size: pageSize,
      };
      if (caseId) params.case = caseId;

      const response = await evidenceService.getEvidence(params);
      setEvidence(response.results);
      setTotalCount(response.count);
    } catch (err: any) {
      console.error('Failed to load evidence:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      witness_statement: 'info',
      biological: 'error',
      vehicle: 'warning',
      identification: 'primary',
      other: 'default',
    };
    return colors[type] || 'default';
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
            Evidence
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate(`${ROUTES.EVIDENCE_CREATE}${caseId ? `?case=${caseId}` : ''}`)}
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
            Add Evidence
          </Button>
        </Box>

        {isLoading ? (
          <TableSkeleton rows={5} columns={5} />
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
                    <TableCell>Type</TableCell>
                    <TableCell>Recorded By</TableCell>
                    <TableCell>Created Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {evidence.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography
                          sx={{
                            color: 'var(--text-secondary)',
                            fontSize: 'var(--body-base-size)',
                          }}
                        >
                          No evidence found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    evidence.map((item) => (
                      <TableRow
                        key={item.id}
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
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{item.title}</TableCell>
                        <TableCell>
                          <Chip
                            label={item.evidence_type.replace('_', ' ')}
                            color={getTypeColor(item.evidence_type)}
                            size="small"
                            sx={{
                              fontWeight: 'var(--font-weight-medium)',
                              fontSize: 'var(--label-small-size)',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {item.recorded_by?.full_name || item.recorded_by?.username}
                        </TableCell>
                        <TableCell>{formatDate(item.created_date)}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => navigate(ROUTES.EVIDENCE_DETAIL(item.id))}
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


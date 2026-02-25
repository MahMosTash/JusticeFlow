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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Evidence
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate(`${ROUTES.EVIDENCE_CREATE}${caseId ? `?case=${caseId}` : ''}`)}
        >
          Add Evidence
        </Button>
      </Box>

      {isLoading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
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
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary">No evidence found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  evidence.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.evidence_type.replace('_', ' ')}
                          color={getTypeColor(item.evidence_type)}
                          size="small"
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
          />
        </>
      )}
    </Container>
  );
};


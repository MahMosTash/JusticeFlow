/**
 * Most Wanted / Under Severe Surveillance page
 */
import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { investigationService } from '@/services/investigationService';
import { Suspect } from '@/types/api';
import { TableSkeleton } from '@/components/common/Skeleton';

export const MostWantedPage: React.FC = () => {
  const [mostWanted, setMostWanted] = useState<Array<{ suspect: Suspect; ranking: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMostWanted = async () => {
      try {
        setIsLoading(true);
        const data = await investigationService.getMostWanted();
        setMostWanted(data);
      } catch (err: any) {
        console.error('Failed to load most wanted:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMostWanted();
  }, []);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <TableSkeleton rows={5} columns={5} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Most Wanted / Under Severe Surveillance
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Suspects under investigation for more than 30 days, ranked by severity and investigation duration.
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Days Under Investigation</TableCell>
              <TableCell>Ranking Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mostWanted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary">No suspects under severe surveillance</Typography>
                </TableCell>
              </TableRow>
            ) : (
              mostWanted.map((item, index) => (
                <TableRow key={item.suspect.id}>
                  <TableCell>
                    <Typography variant="h6">#{index + 1}</Typography>
                  </TableCell>
                  <TableCell>
                    {item.suspect.user
                      ? item.suspect.user.full_name
                      : item.suspect.name || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.suspect.status}
                      color={
                        item.suspect.status === 'Under Severe Surveillance' ? 'error' : 'warning'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{item.suspect.days_under_investigation || 0} days</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {item.ranking}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};


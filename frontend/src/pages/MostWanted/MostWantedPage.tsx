/**
 * Most Wanted / Under Severe Surveillance page
 */
import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
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
  const [mostWanted, setMostWanted] = useState<Array<{ suspect: Suspect; ranking: number; reward_amount: number }>>([]);
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
      <Box
        sx={{
          minHeight: '100vh',
          background: 'var(--gradient-page-bg)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <TableSkeleton rows={5} columns={5} />
        </Container>
      </Box>
    );
  }

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
            mb: 2,
          }}
        >
          Most Wanted / Under Severe Surveillance
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'var(--text-secondary)',
            fontSize: 'var(--body-large-size)',
            mb: 4,
            lineHeight: 'var(--line-height-relaxed)',
          }}
        >
          Suspects under investigation for more than 30 days, ranked by severity and investigation duration.
        </Typography>

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
                  '& .MuiTableCell-head': {
                    color: 'var(--text-primary)',
                    fontWeight: 'var(--font-weight-semibold)',
                    fontSize: 'var(--heading-h5-size)',
                    borderBottom: '1px solid var(--glass-border)',
                  },
                }}
              >
                <TableCell>Rank</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Days Under Investigation</TableCell>
                <TableCell>Reward Prize</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mostWanted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography
                      sx={{
                        color: 'var(--text-secondary)',
                        fontSize: 'var(--body-base-size)',
                      }}
                    >
                      No suspects under severe surveillance
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                mostWanted.map((item, index) => (
                  <TableRow
                    key={item.suspect.id}
                    sx={{
                      '& .MuiTableCell-body': {
                        color: 'var(--text-primary)',
                        fontSize: 'var(--body-base-size)',
                        borderBottom: '1px solid var(--glass-border)',
                      },
                      '&:hover': {
                        background: 'var(--bg-elevated)',
                      },
                      transition: 'var(--transition-base)',
                    }}
                  >
                    <TableCell>
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: 'var(--heading-h4-size)',
                          fontWeight: 'var(--font-weight-bold)',
                          color: 'var(--accent-primary)',
                        }}
                      >
                        #{index + 1}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontSize: 'var(--body-base-size)',
                          color: 'var(--text-primary)',
                          fontWeight: 'var(--font-weight-medium)',
                        }}
                      >
                        {item.suspect.user
                          ? item.suspect.user.full_name
                          : item.suspect.name || 'Unknown'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.suspect.status}
                        color={
                          item.suspect.status === 'Under Severe Surveillance' ? 'error' : 'warning'
                        }
                        size="small"
                        sx={{
                          fontWeight: 'var(--font-weight-medium)',
                          fontSize: 'var(--label-small-size)',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontSize: 'var(--body-base-size)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {item.suspect.days_under_investigation || 0} days
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 'var(--font-weight-bold)',
                          fontSize: 'var(--body-base-size)',
                          color: 'var(--accent-primary)',
                        }}
                      >
                        {item.reward_amount.toLocaleString()} Rials
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
};


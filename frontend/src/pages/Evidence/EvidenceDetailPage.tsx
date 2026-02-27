/**
 * Evidence detail page
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Link,
} from '@mui/material';
import { ArrowBack, Image, VideoFile, AudioFile } from '@mui/icons-material';
import { evidenceService } from '@/services/evidenceService';
import { Evidence } from '@/types/api';
import { CardSkeleton } from '@/components/common/Skeleton';
import { ROUTES } from '@/constants/routes';
import { formatDateTime } from '@/utils/dateUtils';

export const EvidenceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [evidence, setEvidence] = useState<Evidence | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadEvidence();
    }
  }, [id]);

  const loadEvidence = async () => {
    try {
      setIsLoading(true);
      const data = await evidenceService.getEvidenceById(parseInt(id!));
      setEvidence(data);
    } catch (err: any) {
      console.error('Failed to load evidence:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <CardSkeleton />
      </Container>
    );
  }

  if (!evidence) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Evidence not found</Typography>
      </Container>
    );
  }

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
      <Container maxWidth="lg" sx={{ py: 6, position: 'relative', zIndex: 1 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(ROUTES.EVIDENCE)}
            sx={{
              color: 'var(--text-secondary)',
              '&:hover': {
                color: 'var(--accent-primary)',
                background: 'var(--accent-primary-light)',
              },
            }}
          >
            Back to Evidence
          </Button>
        </Box>

        <Card
          className="glass-effect"
          sx={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
              <Box>
                <Typography
                  variant="h1"
                  component="h1"
                  sx={{
                    fontSize: 'var(--heading-h1-size)',
                    fontWeight: 'var(--heading-h1-weight)',
                    color: 'var(--text-primary)',
                    mb: 2,
                  }}
                >
                  {evidence.title}
                </Typography>
                <Box display="flex" gap={1} mb={2}>
                  <Chip
                    label={evidence.evidence_type.replace('_', ' ')}
                    color={getTypeColor(evidence.evidence_type)}
                    sx={{
                      fontWeight: 'var(--font-weight-medium)',
                      fontSize: 'var(--label-base-size)',
                    }}
                  />
                </Box>
              </Box>
            </Box>

            <Typography
              variant="body1"
              paragraph
              sx={{
                fontSize: 'var(--body-large-size)',
                color: 'var(--text-primary)',
                lineHeight: 'var(--line-height-relaxed)',
              }}
            >
              {evidence.description}
            </Typography>

            <Grid container spacing={2} mt={2}>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 'var(--label-base-size)',
                    color: 'var(--text-secondary)',
                    mb: 0.5,
                  }}
                >
                  Recorded By
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: 'var(--body-base-size)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {evidence.recorded_by?.full_name || evidence.recorded_by?.username}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 'var(--label-base-size)',
                    color: 'var(--text-secondary)',
                    mb: 0.5,
                  }}
                >
                  Created Date
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: 'var(--body-base-size)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {formatDateTime(evidence.created_date)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 'var(--label-base-size)',
                    color: 'var(--text-secondary)',
                    mb: 0.5,
                  }}
                >
                  Case
                </Typography>
                <Button
                  variant="text"
                  onClick={() => {
                    const caseId = typeof evidence.case === 'object' ? evidence.case.id : evidence.case;
                    navigate(ROUTES.CASE_DETAIL(caseId));
                  }}
                  sx={{
                    color: 'var(--accent-primary)',
                    '&:hover': {
                      background: 'var(--accent-primary-light)',
                    },
                  }}
                >
                  {typeof evidence.case === 'object'
                    ? `View Case #${evidence.case.id}: ${evidence.case.title}`
                    : `View Case #${evidence.case}`
                  }
                </Button>
              </Grid>
            </Grid>

          {/* ═══ Witness Statement Details ═══ */}
          {evidence.evidence_type === 'witness_statement' && (
            <Box mt={3}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: 'var(--heading-h3-size)',
                  fontWeight: 'var(--heading-h3-weight)',
                  color: 'var(--text-primary)',
                  mb: 2,
                }}
              >
                Witness Statement Details
              </Typography>
              {evidence.transcript && (
                <Typography
                  variant="body2"
                  paragraph
                  sx={{
                    fontSize: 'var(--body-base-size)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <strong>Transcript:</strong> {evidence.transcript}
                </Typography>
              )}
              <Grid container spacing={2}>
                {evidence.witness_name && (
                  <Grid item xs={12} sm={4}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: 'var(--label-base-size)',
                        color: 'var(--text-secondary)',
                        mb: 0.5,
                      }}
                    >
                      Witness Name
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: 'var(--body-base-size)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {evidence.witness_name}
                    </Typography>
                  </Grid>
                )}
                {evidence.witness_national_id && (
                  <Grid item xs={12} sm={4}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: 'var(--label-base-size)',
                        color: 'var(--text-secondary)',
                        mb: 0.5,
                      }}
                    >
                      National ID
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: 'var(--body-base-size)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {evidence.witness_national_id}
                    </Typography>
                  </Grid>
                )}
                {evidence.witness_phone && (
                  <Grid item xs={12} sm={4}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: 'var(--label-base-size)',
                        color: 'var(--text-secondary)',
                        mb: 0.5,
                      }}
                    >
                      Phone
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: 'var(--body-base-size)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {evidence.witness_phone}
                    </Typography>
                  </Grid>
                )}
              </Grid>
              {/* Media attachments */}
              {(evidence.image || evidence.video || evidence.audio) && (
                <Box mt={2}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontSize: 'var(--heading-h5-size)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--text-primary)',
                      mb: 1,
                    }}
                  >
                    Attached Media
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    {evidence.image && (
                      <Link
                        href={evidence.image}
                        target="_blank"
                        rel="noopener"
                        underline="hover"
                        display="flex"
                        alignItems="center"
                        gap={0.5}
                        sx={{
                          color: 'var(--accent-primary)',
                          '&:hover': {
                            color: 'var(--accent-primary-hover)',
                          },
                        }}
                      >
                        <Image fontSize="small" /> View Image
                      </Link>
                    )}
                    {evidence.video && (
                      <Link
                        href={evidence.video}
                        target="_blank"
                        rel="noopener"
                        underline="hover"
                        display="flex"
                        alignItems="center"
                        gap={0.5}
                        sx={{
                          color: 'var(--accent-primary)',
                          '&:hover': {
                            color: 'var(--accent-primary-hover)',
                          },
                        }}
                      >
                        <VideoFile fontSize="small" /> View Video
                      </Link>
                    )}
                    {evidence.audio && (
                      <Link
                        href={evidence.audio}
                        target="_blank"
                        rel="noopener"
                        underline="hover"
                        display="flex"
                        alignItems="center"
                        gap={0.5}
                        sx={{
                          color: 'var(--accent-primary)',
                          '&:hover': {
                            color: 'var(--accent-primary-hover)',
                          },
                        }}
                      >
                        <AudioFile fontSize="small" /> View Audio
                      </Link>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {/* ═══ Biological Evidence Details ═══ */}
          {evidence.evidence_type === 'biological' && (
            <Box mt={3}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: 'var(--heading-h3-size)',
                  fontWeight: 'var(--heading-h3-weight)',
                  color: 'var(--text-primary)',
                  mb: 2,
                }}
              >
                Biological Evidence Details
              </Typography>
              {evidence.evidence_category && (
                <Typography
                  variant="body2"
                  paragraph
                  sx={{
                    fontSize: 'var(--body-base-size)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <strong>Category:</strong> {evidence.evidence_category}
                </Typography>
              )}
              {/* Verification status */}
              <Box mb={2}>
                <Chip
                  label={evidence.verified_by_forensic_doctor ? 'Verified' : 'Not Verified'}
                  color={evidence.verified_by_forensic_doctor ? 'success' : 'warning'}
                  size="small"
                  sx={{
                    fontWeight: 'var(--font-weight-medium)',
                    fontSize: 'var(--label-small-size)',
                  }}
                />
                {evidence.verified_by_forensic_doctor && (
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      fontSize: 'var(--body-base-size)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    Verified by: {evidence.verified_by_forensic_doctor.full_name || evidence.verified_by_forensic_doctor.username}
                    {evidence.verification_date && ` on ${formatDateTime(evidence.verification_date)}`}
                  </Typography>
                )}
                {evidence.verification_notes && (
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.5,
                      fontSize: 'var(--body-base-size)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <strong>Notes:</strong> {evidence.verification_notes}
                  </Typography>
                )}
              </Box>
              {/* Images */}
              {(evidence.image1 || evidence.image2 || evidence.image3) && (
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontSize: 'var(--heading-h5-size)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--text-primary)',
                      mb: 1,
                    }}
                  >
                    Images
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    {evidence.image1 && (
                      <Link
                        href={evidence.image1}
                        target="_blank"
                        rel="noopener"
                        underline="hover"
                        display="flex"
                        alignItems="center"
                        gap={0.5}
                        sx={{
                          color: 'var(--accent-primary)',
                          '&:hover': {
                            color: 'var(--accent-primary-hover)',
                          },
                        }}
                      >
                        <Image fontSize="small" /> View Image 1
                      </Link>
                    )}
                    {evidence.image2 && (
                      <Link
                        href={evidence.image2}
                        target="_blank"
                        rel="noopener"
                        underline="hover"
                        display="flex"
                        alignItems="center"
                        gap={0.5}
                        sx={{
                          color: 'var(--accent-primary)',
                          '&:hover': {
                            color: 'var(--accent-primary-hover)',
                          },
                        }}
                      >
                        <Image fontSize="small" /> View Image 2
                      </Link>
                    )}
                    {evidence.image3 && (
                      <Link
                        href={evidence.image3}
                        target="_blank"
                        rel="noopener"
                        underline="hover"
                        display="flex"
                        alignItems="center"
                        gap={0.5}
                        sx={{
                          color: 'var(--accent-primary)',
                          '&:hover': {
                            color: 'var(--accent-primary-hover)',
                          },
                        }}
                      >
                        <Image fontSize="small" /> View Image 3
                      </Link>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {/* ═══ Vehicle Evidence Details ═══ */}
          {evidence.evidence_type === 'vehicle' && (
            <Box mt={3}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: 'var(--heading-h3-size)',
                  fontWeight: 'var(--heading-h3-weight)',
                  color: 'var(--text-primary)',
                  mb: 2,
                }}
              >
                Vehicle Evidence Details
              </Typography>
              <Grid container spacing={2}>
                {evidence.model && (
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: 'var(--label-base-size)',
                        color: 'var(--text-secondary)',
                        mb: 0.5,
                      }}
                    >
                      Model
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: 'var(--body-base-size)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {evidence.model}
                    </Typography>
                  </Grid>
                )}
                {evidence.color && (
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: 'var(--label-base-size)',
                        color: 'var(--text-secondary)',
                        mb: 0.5,
                      }}
                    >
                      Color
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: 'var(--body-base-size)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {evidence.color}
                    </Typography>
                  </Grid>
                )}
                {evidence.license_plate && (
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: 'var(--label-base-size)',
                        color: 'var(--text-secondary)',
                        mb: 0.5,
                      }}
                    >
                      License Plate
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: 'var(--body-base-size)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {evidence.license_plate}
                    </Typography>
                  </Grid>
                )}
                {evidence.serial_number && (
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: 'var(--label-base-size)',
                        color: 'var(--text-secondary)',
                        mb: 0.5,
                      }}
                    >
                      Serial Number
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: 'var(--body-base-size)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {evidence.serial_number}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          {/* ═══ Identification Document Details ═══ */}
          {evidence.evidence_type === 'identification' && (
            <Box mt={3}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: 'var(--heading-h3-size)',
                  fontWeight: 'var(--heading-h3-weight)',
                  color: 'var(--text-primary)',
                  mb: 2,
                }}
              >
                Identification Document Details
              </Typography>
              {evidence.full_name && (
                <Typography
                  variant="body2"
                  paragraph
                  sx={{
                    fontSize: 'var(--body-base-size)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <strong>Full Name:</strong> {evidence.full_name}
                </Typography>
              )}
              {evidence.metadata && Object.keys(evidence.metadata).length > 0 && (
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontSize: 'var(--heading-h5-size)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--text-primary)',
                      mb: 1,
                    }}
                  >
                    Metadata
                  </Typography>
                  <Grid container spacing={1}>
                    {Object.entries(evidence.metadata).map(([key, value]) => (
                      <Grid item xs={12} sm={6} key={key}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: 'var(--label-base-size)',
                            color: 'var(--text-secondary)',
                            mb: 0.5,
                          }}
                        >
                          {key.replace(/_/g, ' ')}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: 'var(--body-base-size)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          {String(value)}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Box>
          )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};


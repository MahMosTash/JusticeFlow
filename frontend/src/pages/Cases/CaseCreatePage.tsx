/**
 * Case creation page
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { caseService } from '@/services/caseService';
import { CRIME_SEVERITY_OPTIONS } from '@/constants/crimeSeverity';
import { ROUTES } from '@/constants/routes';
import { Case } from '@/types/api';

const schema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  severity: yup.string().required('Severity is required'),
  incident_date: yup.string(),
  incident_time: yup.string(),
  incident_location: yup.string(),
});

interface CaseFormData {
  title: string;
  description: string;
  severity: string;
  incident_date?: string;
  incident_time?: string;
  incident_location?: string;
}

export const CaseCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CaseFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: CaseFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const newCase = await caseService.createCase(data as Partial<Case>);
      navigate(ROUTES.CASE_DETAIL(newCase.id));
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to create case');
    } finally {
      setIsSubmitting(false);
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
      <Container maxWidth="md" sx={{ py: 6, position: 'relative', zIndex: 1 }}>
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
          Create New Case
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

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
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Title"
                    {...register('title')}
                    error={!!errors.title}
                    helperText={errors.title?.message}
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
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={4}
                    {...register('description')}
                    error={!!errors.description}
                    helperText={errors.description?.message}
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
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Severity"
                    SelectProps={{ native: true }}
                    InputLabelProps={{ shrink: true }}
                    {...register('severity')}
                    error={!!errors.severity}
                    helperText={errors.severity?.message}
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
                      '& select': {
                        color: 'var(--text-primary)',
                      },
                    }}
                  >
                    <option value="">Select Severity</option>
                    {CRIME_SEVERITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Incident Date"
                    InputLabelProps={{ shrink: true }}
                    {...register('incident_date')}
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
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Incident Time"
                    InputLabelProps={{ shrink: true }}
                    {...register('incident_time')}
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
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Incident Location"
                    {...register('incident_location')}
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
                </Grid>
              </Grid>

              <Box mt={4} display="flex" gap={2}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
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
                    '&:disabled': {
                      opacity: 0.6,
                    },
                    transition: 'var(--transition-base)',
                  }}
                >
                  {isSubmitting ? 'Creating...' : 'Create Case'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate(ROUTES.CASES)}
                  sx={{
                    borderColor: 'var(--glass-border)',
                    color: 'var(--text-secondary)',
                    borderRadius: 'var(--radius-md)',
                    px: 3,
                    py: 1.5,
                    fontWeight: 'var(--font-weight-medium)',
                    textTransform: 'none',
                    fontSize: 'var(--button-base-size)',
                    '&:hover': {
                      borderColor: 'var(--accent-primary)',
                      color: 'var(--accent-primary)',
                      background: 'var(--accent-primary-light)',
                    },
                    transition: 'var(--transition-base)',
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};


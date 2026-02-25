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
      const newCase = await caseService.createCase(data);
      navigate(ROUTES.CASE_DETAIL(newCase.id));
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to create case');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Case
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  {...register('title')}
                  error={!!errors.title}
                  helperText={errors.title?.message}
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
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Severity"
                  SelectProps={{ native: true }}
                  {...register('severity')}
                  error={!!errors.severity}
                  helperText={errors.severity?.message}
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
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Incident Time"
                  InputLabelProps={{ shrink: true }}
                  {...register('incident_time')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Incident Location"
                  {...register('incident_location')}
                />
              </Grid>
            </Grid>

            <Box mt={3} display="flex" gap={2}>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Case'}
              </Button>
              <Button variant="outlined" onClick={() => navigate(ROUTES.CASES)}>
                Cancel
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};


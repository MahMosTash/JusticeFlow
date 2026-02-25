/**
 * Evidence creation page
 */
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { evidenceService } from '@/services/evidenceService';
import { ROUTES } from '@/constants/routes';
import { caseService } from '@/services/caseService';
import { Case } from '@/types/api';

const schema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  evidence_type: yup.string().required('Evidence type is required'),
  case_id: yup.number().required('Case is required'),
});

interface EvidenceFormData {
  title: string;
  description: string;
  evidence_type: string;
  case_id: number;
  transcript?: string;
  witness_name?: string;
  witness_national_id?: string;
  witness_phone?: string;
}

export const EvidenceCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const caseIdParam = searchParams.get('case');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cases, setCases] = useState<Case[]>([]);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const response = await caseService.getCases({ page_size: 100 });
      setCases(response.results);
    } catch (err) {
      console.error('Failed to load cases:', err);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EvidenceFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      case_id: caseIdParam ? parseInt(caseIdParam) : undefined,
    },
  });

  const evidenceType = watch('evidence_type');

  useEffect(() => {
    if (caseIdParam) {
      setValue('case_id', parseInt(caseIdParam));
    }
  }, [caseIdParam, setValue]);

  const onSubmit = async (data: EvidenceFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('evidence_type', data.evidence_type);
      formData.append('case', data.case_id.toString());
      
      if (data.evidence_type === 'witness_statement') {
        if (data.transcript) formData.append('transcript', data.transcript);
        if (data.witness_name) formData.append('witness_name', data.witness_name);
        if (data.witness_national_id) formData.append('witness_national_id', data.witness_national_id);
        if (data.witness_phone) formData.append('witness_phone', data.witness_phone);
      }
      
      const newEvidence = await evidenceService.createEvidence(formData);
      navigate(ROUTES.EVIDENCE_DETAIL(newEvidence.id));
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to create evidence');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Create Evidence
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
                <FormControl fullWidth>
                  <InputLabel>Case</InputLabel>
                  <Select
                    {...register('case_id')}
                    value={watch('case_id') || ''}
                    onChange={(e) => setValue('case_id', e.target.value as number)}
                    error={!!errors.case_id}
                  >
                    {cases.map((caseItem) => (
                      <MenuItem key={caseItem.id} value={caseItem.id}>
                        Case #{caseItem.id}: {caseItem.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
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
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Evidence Type</InputLabel>
                  <Select
                    {...register('evidence_type')}
                    value={watch('evidence_type') || ''}
                    onChange={(e) => setValue('evidence_type', e.target.value)}
                    error={!!errors.evidence_type}
                  >
                    <MenuItem value="witness_statement">Witness Statement</MenuItem>
                    <MenuItem value="biological">Biological Evidence</MenuItem>
                    <MenuItem value="vehicle">Vehicle Evidence</MenuItem>
                    <MenuItem value="identification">Identification Document</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {evidenceType === 'witness_statement' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Transcript"
                      multiline
                      rows={4}
                      {...register('transcript')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Witness Name"
                      {...register('witness_name')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Witness National ID"
                      {...register('witness_national_id')}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Witness Phone"
                      {...register('witness_phone')}
                    />
                  </Grid>
                </>
              )}
            </Grid>

            <Box mt={3} display="flex" gap={2}>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Evidence'}
              </Button>
              <Button variant="outlined" onClick={() => navigate(ROUTES.EVIDENCE)}>
                Cancel
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};


/**
 * Evidence creation page
 */
import { useState, useEffect, useRef } from 'react';
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
  // Witness Statement
  transcript?: string;
  witness_name?: string;
  witness_national_id?: string;
  witness_phone?: string;
  // Biological
  evidence_category?: string;
  // Vehicle
  model?: string;
  color?: string;
  license_plate?: string;
  serial_number?: string;
  // Identification
  full_name?: string;
  metadata_json?: string;
}

export const EvidenceCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const caseIdParam = searchParams.get('case');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cases, setCases] = useState<Case[]>([]);

  // Use explicit state for evidence type to guarantee re-renders
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // File refs for uploads
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const image1Ref = useRef<HTMLInputElement>(null);
  const image2Ref = useRef<HTMLInputElement>(null);
  const image3Ref = useRef<HTMLInputElement>(null);

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
      formData.append('evidence_type', selectedType);
      formData.append('case_id', data.case_id.toString());

      // ── Witness Statement fields ──
      if (selectedType === 'witness_statement') {
        if (data.transcript) formData.append('transcript', data.transcript);
        if (data.witness_name) formData.append('witness_name', data.witness_name);
        if (data.witness_national_id) formData.append('witness_national_id', data.witness_national_id);
        if (data.witness_phone) formData.append('witness_phone', data.witness_phone);
        if (imageRef.current?.files?.[0]) formData.append('image', imageRef.current.files[0]);
        if (videoRef.current?.files?.[0]) formData.append('video', videoRef.current.files[0]);
        if (audioRef.current?.files?.[0]) formData.append('audio', audioRef.current.files[0]);
      }

      // ── Biological fields ──
      if (selectedType === 'biological') {
        if (selectedCategory) formData.append('evidence_category', selectedCategory);
        if (image1Ref.current?.files?.[0]) formData.append('image1', image1Ref.current.files[0]);
        if (image2Ref.current?.files?.[0]) formData.append('image2', image2Ref.current.files[0]);
        if (image3Ref.current?.files?.[0]) formData.append('image3', image3Ref.current.files[0]);
      }

      // ── Vehicle fields ──
      if (selectedType === 'vehicle') {
        if (data.model) formData.append('model', data.model);
        if (data.color) formData.append('color', data.color);
        if (data.license_plate) formData.append('license_plate', data.license_plate);
        if (data.serial_number) formData.append('serial_number', data.serial_number);
      }

      // ── Identification fields ──
      if (selectedType === 'identification') {
        if (data.full_name) formData.append('full_name', data.full_name);
        if (data.metadata_json) {
          try {
            JSON.parse(data.metadata_json);
            formData.append('metadata', data.metadata_json);
          } catch {
            setError('Metadata must be valid JSON');
            setIsSubmitting(false);
            return;
          }
        }
      }

      const newEvidence = await evidenceService.createEvidence(formData);
      navigate(ROUTES.EVIDENCE_DETAIL(newEvidence.id));
    } catch (err: any) {
      // Extract detailed backend validation errors
      const errData = err?.response?.data;
      if (errData) {
        if (typeof errData === 'string') {
          setError(errData);
        } else if (errData.detail) {
          setError(errData.detail);
        } else if (typeof errData === 'object') {
          const messages = Object.entries(errData)
            .map(([key, val]) => {
              const msg = Array.isArray(val) ? val.join(', ') : String(val);
              return `${key}: ${msg}`;
            })
            .join(' | ');
          setError(messages);
        } else {
          setError('Failed to create evidence');
        }
      } else {
        setError(err?.message || 'Failed to create evidence');
      }
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
                    value={watch('case_id') || ''}
                    onChange={(e) => setValue('case_id', e.target.value as number)}
                    error={!!errors.case_id}
                    label="Case"
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
                    value={selectedType}
                    onChange={(e) => {
                      const val = e.target.value as string;
                      setSelectedType(val);
                      setValue('evidence_type', val);
                    }}
                    error={!!errors.evidence_type}
                    label="Evidence Type"
                  >
                    <MenuItem value="witness_statement">Witness Statement</MenuItem>
                    <MenuItem value="biological">Biological Evidence</MenuItem>
                    <MenuItem value="vehicle">Vehicle Evidence</MenuItem>
                    <MenuItem value="identification">Identification Document</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* ═══ Witness Statement Fields ═══ */}
              {selectedType === 'witness_statement' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Transcript *"
                      multiline
                      rows={4}
                      {...register('transcript')}
                      helperText="Required — the transcribed witness testimony"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Witness Name" {...register('witness_name')} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Witness National ID" {...register('witness_national_id')} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Witness Phone" {...register('witness_phone')} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Image (optional)</Typography>
                    <input type="file" accept="image/*" ref={imageRef} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Video (optional)</Typography>
                    <input type="file" accept="video/mp4,video/mov,video/avi" ref={videoRef} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Audio (optional)</Typography>
                    <input type="file" accept="audio/mp3,audio/wav,audio/m4a" ref={audioRef} />
                  </Grid>
                </>
              )}

              {/* ═══ Biological Evidence Fields ═══ */}
              {selectedType === 'biological' && (
                <>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Evidence Category</InputLabel>
                      <Select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value as string)}
                        label="Evidence Category"
                      >
                        <MenuItem value="blood">Blood</MenuItem>
                        <MenuItem value="hair">Hair</MenuItem>
                        <MenuItem value="fingerprint">Fingerprint</MenuItem>
                        <MenuItem value="dna">DNA</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Image 1 * (required)</Typography>
                    <input type="file" accept="image/*" ref={image1Ref} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Image 2 (optional)</Typography>
                    <input type="file" accept="image/*" ref={image2Ref} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Image 3 (optional)</Typography>
                    <input type="file" accept="image/*" ref={image3Ref} />
                  </Grid>
                </>
              )}

              {/* ═══ Vehicle Evidence Fields ═══ */}
              {selectedType === 'vehicle' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Model *" {...register('model')} helperText="Required — e.g. Peugeot 206" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Color *" {...register('color')} helperText="Required" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="License Plate" {...register('license_plate')} helperText="Provide either License Plate OR Serial Number" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Serial Number" {...register('serial_number')} helperText="Use when vehicle has no license plate" />
                  </Grid>
                </>
              )}

              {/* ═══ Identification Document Fields ═══ */}
              {selectedType === 'identification' && (
                <>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Full Name *" {...register('full_name')} helperText="Required — name on the identification document" />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Metadata (JSON)"
                      multiline
                      rows={3}
                      {...register('metadata_json')}
                      helperText='Optional key-value pairs, e.g. {"card_type": "Passport", "issue_date": "2020-01-01"}'
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

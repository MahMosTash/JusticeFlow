/**
 * Complaint submission page
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
  Alert,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { complaintService } from '@/services/complaintService';
import { ROUTES } from '@/constants/routes';

const schema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
});

interface ComplaintFormData {
  title: string;
  description: string;
}

export const ComplaintSubmitPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ComplaintFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: ComplaintFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await complaintService.submitComplaint(data);
      navigate(ROUTES.COMPLAINTS);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Submit Complaint
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Title"
              margin="normal"
              {...register('title')}
              error={!!errors.title}
              helperText={errors.title?.message}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={6}
              margin="normal"
              {...register('description')}
              error={!!errors.description}
              helperText={errors.description?.message}
            />
            <Box mt={3} display="flex" gap={2}>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
              </Button>
              <Button variant="outlined" onClick={() => navigate(ROUTES.COMPLAINTS)}>
                Cancel
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};


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
          Submit Complaint
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
              <TextField
                fullWidth
                label="Title"
                margin="normal"
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
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={6}
                margin="normal"
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
                  {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate(ROUTES.COMPLAINTS)}
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


/**
 * Skeleton loader components
 */
import { Skeleton as MuiSkeleton, Box, Card, CardContent } from '@mui/material';

export const Skeleton: React.FC<{ variant?: 'text' | 'circular' | 'rectangular'; width?: number | string; height?: number }> = ({
  variant = 'text',
  width,
  height,
}) => {
  return <MuiSkeleton variant={variant} width={width} height={height} />;
};

export const CardSkeleton: React.FC = () => {
  return (
    <Card>
      <CardContent>
        <MuiSkeleton variant="text" width="60%" height={32} />
        <MuiSkeleton variant="text" width="40%" height={24} />
        <Box mt={2}>
          <MuiSkeleton variant="rectangular" width="100%" height={100} />
        </Box>
      </CardContent>
    </Card>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <Box>
      {Array.from({ length: rows }).map((_, i) => (
        <Box key={i} display="flex" gap={2} mb={1}>
          {Array.from({ length: columns }).map((_, j) => (
            <MuiSkeleton key={j} variant="text" width="100%" height={40} />
          ))}
        </Box>
      ))}
    </Box>
  );
};


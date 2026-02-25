/**
 * Loading spinner component
 */
import { Box, CircularProgress } from '@mui/material';

interface LoadingProps {
  size?: number;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ size = 40, fullScreen = false }) => {
  const content = <CircularProgress size={size} />;

  if (fullScreen) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        width="100%"
      >
        {content}
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" p={3}>
      {content}
    </Box>
  );
};


/**
 * Loading component tests
 */
import { render, screen } from '@testing-library/react';
import { Loading } from '@/components/common/Loading';

describe('Loading', () => {
  it('renders loading spinner', () => {
    render(<Loading />);
    // Material-UI CircularProgress renders as SVG
    const spinner = screen.getByRole('progressbar');
    expect(spinner).toBeInTheDocument();
  });

  it('renders full screen loading when fullScreen prop is true', () => {
    const { container } = render(<Loading fullScreen />);
    const box = container.querySelector('div');
    expect(box).toHaveStyle({ minHeight: '100vh' });
  });

  it('uses custom size when provided', () => {
    render(<Loading size={60} />);
    const spinner = screen.getByRole('progressbar');
    expect(spinner).toBeInTheDocument();
  });
});


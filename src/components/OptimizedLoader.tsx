import { memo } from 'react';

interface OptimizedLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const OptimizedLoader = memo(({ size = 'md', className = '' }: OptimizedLoaderProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  };

  return (
    <div className={`flex items-center justify-center min-h-screen bg-black ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-white ${sizeClasses[size]}`}></div>
    </div>
  );
});

OptimizedLoader.displayName = 'OptimizedLoader';

export default OptimizedLoader;
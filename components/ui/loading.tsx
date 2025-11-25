export function Loading({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div
        className={`${sizeClasses[size]} border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin`}
      />
    </div>
  );
}

export function LoadingSpinner() {
  return <Loading />;
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loading size="lg" />
    </div>
  );
}


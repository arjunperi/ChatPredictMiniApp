export function Skeleton({
  className = '',
  variant = 'rectangular',
}: {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}) {
  const baseClasses = 'animate-pulse bg-slate-700';
  
  const variantClasses = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded h-4',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <Skeleton className="h-6 w-3/4 mb-3" variant="text" />
      <Skeleton className="h-4 w-full mb-2" variant="text" />
      <Skeleton className="h-4 w-2/3" variant="text" />
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}


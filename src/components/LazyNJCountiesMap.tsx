import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const NJCountiesMap = lazy(() => import('@/components/NJCountiesMap'));

const LazyNJCountiesMap = () => {
  return (
    <Suspense 
      fallback={
        <div className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Skeleton className="h-8 w-64 mx-auto mb-4" />
              <Skeleton className="h-4 w-96 mx-auto" />
            </div>
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        </div>
      }
    >
      <NJCountiesMap />
    </Suspense>
  );
};

export default LazyNJCountiesMap;
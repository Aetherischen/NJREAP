import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const HowToPrepareSection = lazy(() => import('@/components/HowToPrepareSection'));

const LazyHowToPrepareSection = () => {
  return (
    <Suspense 
      fallback={
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Skeleton className="h-8 w-80 mx-auto mb-4" />
              <Skeleton className="h-4 w-96 mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <HowToPrepareSection />
    </Suspense>
  );
};

export default LazyHowToPrepareSection;
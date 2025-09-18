'use client';

import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Dynamically import the InteractiveMap component with SSR disabled
const InteractiveMap = dynamic(
  () => import('./InteractiveMap').then(mod => ({
    default: mod.InteractiveMap,
  })),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }
);

export default function MapClient(props: any) {
  return <InteractiveMap {...props} />;
}

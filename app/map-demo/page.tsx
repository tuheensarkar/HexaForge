"use client"

import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Dynamically import the EnhancedMap component with SSR disabled
const EnhancedMap = dynamic(
  () => import('@/components/EnhancedMap').then(mod => ({
    default: mod.EnhancedMap,
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

export default function MapDemo() {
  const handleDistrictClick = (data: any) => {
    console.log('District clicked:', data)
    // Custom handling logic can be added here
  }

  return (
    <div className="h-screen w-full">
      <div className="h-full w-full p-4">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Enhanced WebGIS - Tribal Population Map
        </h1>
        <div className="h-[calc(100vh-120px)] w-full border border-gray-300 rounded-lg overflow-hidden">
          <EnhancedMap 
            center={[20.5937, 78.9629]}
            zoom={5}
            onDistrictClick={handleDistrictClick}
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  )
}
"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { GeoJSON, Marker, useMap } from 'react-leaflet'
import L, { Layer, Map, Marker as LeafletMarker, divIcon, DivIcon } from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in Next.js
import 'leaflet-defaulticon-compatibility'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'

// Extend the Window interface to include Leaflet
declare global {
  interface Window {
    L: typeof L;
  }
}

// Initialize L on window for plugins
if (typeof window !== 'undefined') {
  window.L = L;
}

// Interfaces
export interface StateProperties {
  name: string
  code: string
  tribalPopulation: number
  totalPopulation: number
  tribalPercentage: number
  fraClaimsCount: number
  districts: number
  forestCover: number
  forestArea?: number
  tribalForestArea?: number
  tribalForestPercentage?: number
  fraClaims?: number
  fraArea?: number
  fraPercentage?: number
  color?: string
  centroid?: [number, number]
}

interface StateWithGeometry {
  properties: StateProperties;
  geometry: {
    coordinates: number[][][];
    [key: string]: any;
  };
  [key: string]: any;
}

interface StateGeoJSON {
  type: 'Feature'
  properties: StateProperties
  geometry: {
    type: 'Polygon'
    coordinates: number[][][]
  }
}

interface StateLayerProps {
  onStateClick?: (state: StateProperties) => void
  onStateHover?: (state: StateProperties | null) => void
  className?: string
}

// GeoJSON Data
const indiaStatesGeoJSON: StateGeoJSON[] = [
  {
    type: 'Feature',
    properties: {
      name: 'Madhya Pradesh',
      code: 'MP',
      tribalPopulation: 15316784,
      totalPopulation: 85358965,
      tribalPercentage: 21.09,
      fraClaimsCount: 2287,
      districts: 55,
      forestCover: 25.15
    },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [74.029, 21.082], [74.5, 21.0], [75.0, 21.5], [76.0, 21.5],
        [77.0, 22.0], [78.0, 22.5], [79.0, 23.0], [80.0, 23.5],
        [81.0, 24.0], [81.5, 24.5], [81.0, 25.0], [80.5, 25.5],
        [80.0, 26.0], [79.0, 26.0], [78.0, 26.0], [77.0, 25.5],
        [76.0, 25.0], [75.0, 24.5], [74.5, 24.0], [74.0, 23.5],
        [73.5, 23.0], [73.5, 22.0], [74.0, 21.5], [74.029, 21.082]
      ]]
    }
  },
  {
    type: 'Feature',
    properties: {
      name: 'Odisha',
      code: 'OR',
      tribalPopulation: 9590756,
      totalPopulation: 45429399,
      tribalPercentage: 22.85,
      fraClaimsCount: 1342,
      districts: 30,
      forestCover: 33.16
    },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [81.338, 17.780], [82.211, 17.836], [83.101, 18.302], [83.892, 18.302], 
        [84.341, 18.795], [85.095, 19.565], [85.605, 20.097], [86.089, 20.736], 
        [86.797, 21.004], [86.814, 21.993], [86.237, 22.147], [85.221, 22.127], 
        [84.681, 21.993], [84.395, 21.719], [84.007, 21.545], [83.771, 21.177], 
        [83.370, 20.756], [82.667, 20.324], [82.419, 19.874], [81.896, 19.565], 
        [81.522, 19.177], [81.111, 18.795], [80.781, 18.271], [81.338, 17.780]
      ]]
    }
  },
  {
    type: 'Feature',
    properties: {
      name: 'Telangana',
      code: 'TG',
      tribalPopulation: 3504543,
      totalPopulation: 39362732,
      tribalPercentage: 9.34,
      fraClaimsCount: 645,
      districts: 33,
      forestCover: 24.0
    },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [77.234, 15.234], [78.0, 15.5], [79.0, 16.0], [80.0, 16.5],
        [80.5, 17.0], [80.8, 17.5], [80.7, 18.0], [80.3, 18.5],
        [79.8, 19.0], [79.2, 19.3], [78.5, 19.5], [77.8, 19.0],
        [77.5, 18.5], [77.3, 18.0], [77.1, 17.5], [77.0, 17.0],
        [76.9, 16.5], [77.0, 16.0], [77.1, 15.5], [77.234, 15.234]
      ]]
    }
  },
  {
    type: 'Feature',
    properties: {
      name: 'Tripura',
      code: 'TR',
      tribalPopulation: 1166813,
      totalPopulation: 4169794,
      tribalPercentage: 31.78,
      fraClaimsCount: 234,
      districts: 8,
      forestCover: 73.68
    },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [91.234, 22.567], [91.5, 22.6], [92.0, 22.8], [92.3, 23.0],
        [92.5, 23.5], [92.6, 23.8], [92.5, 24.2], [92.3, 24.5],
        [92.0, 24.7], [91.7, 24.6], [91.5, 24.4], [91.3, 24.1],
        [91.2, 23.8], [91.1, 23.5], [91.0, 23.2], [91.1, 22.9],
        [91.2, 22.7], [91.234, 22.567]
      ]]
    }
  }
]

// Helpers
const getStateColor = (tribalPercentage: number): string => {
  if (tribalPercentage >= 80) return '#7f1d1d'
  if (tribalPercentage >= 25) return '#dc2626'
  if (tribalPercentage >= 15) return '#ef4444'
  if (tribalPercentage >= 10) return '#f59e0b'
  if (tribalPercentage >= 5) return '#eab308'
  return '#22c55e'
}

const calculatePolygonCentroid = (coordinates: number[][]): [number, number] => {
  let totalArea = 0
  let centroidLat = 0
  let centroidLng = 0
  const points = coordinates
  const n = points.length

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    const [lng1, lat1] = points[i]
    const [lng2, lat2] = points[j]
    const crossProduct = lng1 * lat2 - lng2 * lat1
    totalArea += crossProduct
    centroidLat += (lat1 + lat2) * crossProduct
    centroidLng += (lng1 + lng2) * crossProduct
  }

  totalArea *= 0.5
  centroidLat /= (6 * totalArea)
  centroidLng /= (6 * totalArea)

  return [centroidLat, centroidLng]
}

const createStateLabelIcon = (state: StateProperties): DivIcon => {
  const color = getStateColor(state.tribalPercentage)
  return divIcon({
    html: `
      <div style="
        position: relative;
        z-index: 1000;
        pointer-events: none;
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid rgba(203, 213, 225, 0.8);
        border-radius: 6px;
        padding: 6px 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        text-align: center;
        min-width: 100px;
        backdrop-filter: blur(4px);
      ">
        <div style="font-size: 12px; font-weight: 600; color: #1e293b;">
          ${state.name}
        </div>
        <div style="font-size: 10px; color: ${color}; font-weight: 600; margin-top: 2px;">
          ${state.tribalPercentage.toFixed(1)}% Tribal Population
        </div>
      </div>
    `,
    className: 'state-label-icon',
    iconSize: [120, 50],
    iconAnchor: [60, 25]
  })
}

// Component
export const StateLayer: React.FC<StateLayerProps> = ({
  onStateClick,
  onStateHover,
}) => {
  const map = useMap() as Map
  const [hoveredState, setHoveredState] = useState<string | null>(null)
  const [labelMarkers, setLabelMarkers] = useState<LeafletMarker[]>([])

  // Unique state data
  const stateData = useMemo(() => {
    return indiaStatesGeoJSON.map(state => {
      const centroid = calculatePolygonCentroid(state.geometry.coordinates[0])
      const color = getStateColor(state.properties.tribalPercentage)
      return { ...state, centroid, color }
    })
  }, [])

  const renderedStates = useMemo(() => {
    const seen: Record<string, boolean> = {}
    return stateData.filter(s => {
      if (seen[s.properties.code]) return false
      seen[s.properties.code] = true
      return true
    })
  }, [stateData])

  const geoJsonData = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: renderedStates.map((state: any) => ({
      type: 'Feature' as const,
      properties: { ...state.properties, id: state.properties.code },
      geometry: state.geometry
    }))
  }), [renderedStates])

  // Fit bounds only once using GeoJSON
  useEffect(() => {
    if (map && geoJsonData.features.length > 0) {
      const geoJsonLayer = L.geoJSON(geoJsonData as any)
      map.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] })
    }
  }, [map, geoJsonData])

  // State labels
  useEffect(() => {
    if (!map) return
    labelMarkers.forEach(m => map.removeLayer(m))
    const newMarkers = renderedStates.map(state =>
      L.marker(state.centroid, {
        icon: createStateLabelIcon(state.properties),
        interactive: false
      }).addTo(map)
    )
    setLabelMarkers(newMarkers)
    return () => { newMarkers.forEach(m => map.removeLayer(m)) }
  }, [map, renderedStates])

  // Style with clean borders
  const style = useCallback((feature: any) => {
    const isHovered = hoveredState === feature.properties.code;
    const baseColor = getStateColor(feature.properties.tribalPercentage);
    
    return {
      fillColor: baseColor,
      weight: isHovered ? 2 : 0.5,  // Reduced default weight
      opacity: 1,
      color: isHovered ? '#1e40af' : '#ffffff',
      fillOpacity: isHovered ? 0.7 : 0.6,  // Adjusted fill opacity
      className: 'state-polygon',
      interactive: true,
      stroke: true,
      fill: true,
      lineJoin: 'round',
      lineCap: 'round',
      fillRule: 'evenodd',
      shadow: false,
      renderer: L.canvas(),  // Use canvas renderer for better performance
      bubblingMouseEvents: false  // Prevent event propagation to parent layers
    };
  }, [hoveredState]);

  const onEachFeature = useCallback((feature: any, layer: L.Layer) => {
    if (!(layer instanceof L.Polygon)) return;
    
    // Store the original style
    const originalStyle = { 
      weight: 1,
      color: '#ffffff',
      fillOpacity: 0.6,
      fillColor: getStateColor(feature.properties.tribalPercentage)
    };
    
    // Set initial style
    layer.setStyle(originalStyle);
    
    layer.on({
      mouseover: (e: L.LeafletMouseEvent) => {
        const target = e.target as L.Polygon;
        setHoveredState(feature.properties.code);
        onStateHover?.(feature.properties);
        
        target.setStyle({
          weight: 2.5,
          color: '#1e40af',
          fillOpacity: 0.7,
          className: 'state-polygon-hover'
        });
        
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
          target.bringToFront();
        }
        
        target.bindTooltip(
          `<div><strong>${feature.properties.name}</strong></div>
           <div>Tribal Population: ${feature.properties.tribalPercentage.toFixed(1)}%</div>
           <div>FRA Claims: ${feature.properties.fraClaimsCount.toLocaleString()}</div>`,
          { 
            permanent: false, 
            direction: 'top', 
            className: 'custom-tooltip',
            offset: [0, -10]
          }
        ).openTooltip();
      },
      mouseout: () => {
        setHoveredState(null);
        onStateHover?.(null);
        (layer as L.Polygon).setStyle(originalStyle);
      },
      click: () => {
        onStateClick?.(feature.properties);
        map.fitBounds((layer as L.Polygon).getBounds(), { 
          padding: [50, 50],
          animate: true,
          duration: 0.5
        });
      }
    });
  }, [map, onStateClick, onStateHover])

  // Create a canvas renderer for better performance
  const renderer = useMemo(() => L.canvas(), []);

  return (
    <>
      <div className="state-layer-container">
        <GeoJSON
          key="states-geojson"
          data={geoJsonData as any}
          style={style as any}
          onEachFeature={onEachFeature as any}
          // @ts-ignore - The renderer prop exists but TypeScript types are not up to date
          renderer={renderer}
        />
      </div>
      <style jsx global>{`
        .state-layer-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        
        .custom-tooltip {
          background: rgba(0, 0, 0, 0.8) !important;
          border-radius: 6px !important;
          color: white !important;
          font-size: 12px !important;
          padding: 8px 12px !important;
          border: none !important;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3) !important;
          pointer-events: none;
        }
        
        .state-polygon { 
          transition: all 0.2s ease-in-out;
          outline: none !important;
          pointer-events: auto !important;
          shape-rendering: crispEdges;
          stroke-linejoin: round;
          stroke-linecap: round;
          vector-effect: non-scaling-stroke;
        }
        
        .state-polygon-hover {
          z-index: 1000 !important;
          stroke-width: 2px !important;
        }
        
        /* Ensure clean rendering of state borders */
        .leaflet-overlay-pane {
          pointer-events: none;
        }
        
        .leaflet-overlay-pane svg {
          shape-rendering: crispEdges;
          pointer-events: none;
        }
        
        .leaflet-overlay-pane svg path {
          vector-effect: non-scaling-stroke;
          pointer-events: auto;
          shape-rendering: crispEdges;
          stroke-linejoin: round;
          stroke-linecap: round;
        }
        
        /* Remove any potential double borders between states */
        .leaflet-layer {
          isolation: isolate;
          pointer-events: none;
        }
        
        /* Fix for canvas rendering */
        .leaflet-container {
          background: #f8f9fa !important;
        }
        
        /* Ensure proper layering */
        .leaflet-pane > svg {
          pointer-events: none;
        }
        
        .leaflet-pane > svg path {
          pointer-events: auto;
        }
      `}</style>
    </>
  )
}

export default StateLayer

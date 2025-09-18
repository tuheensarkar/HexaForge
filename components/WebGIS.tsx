"use client"

import React, { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { useWebGIS } from "@/hooks/useWebGIS"
import type { Village } from "@/types"
import { 
  Map, 
  Satellite, 
  Layers, 
  MapPin, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw, 
  Download, 
  Filter,
  TreePine,
  Home,
  Droplets,
  Mountain,
  Users,
  Info,
  Settings,
  X,
  ChevronDown,
  Eye,
  EyeOff,
  BarChart3,
  Activity
} from "lucide-react"

// Dynamic import for the InteractiveMap to avoid SSR issues with Leaflet
const InteractiveMap = dynamic(
  () => import('./InteractiveMap').then(mod => ({ default: mod.InteractiveMap })),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gradient-to-br from-blue-100 via-green-50 to-blue-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Map className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm text-gray-600">Loading Interactive Map...</p>
        </div>
      </div>
    )
  }
)

export function WebGIS() {
  const {
    mapState,
    layers,
    selectedFeature,
    selectedVillage,
    isLoading,
    geoFeatures,
    mapBounds,
    toggleLayer,
    updateLayerOpacity,
    getLayersByCategory,
    getVisibleLayers,
    updateMapState,
    updateMapBounds,
    centerOnVillage,
    resetMapView,
    onFeatureClick,
    clearSelections,
    searchVillages,
    exportMapData,
    getLayerFeatures,
    getCacheStats
  } = useWebGIS()
  
  // Track analytics for user interactions
  useEffect(() => {
    // Log initial map load
    console.log('WebGIS component loaded with', layers.length, 'available layers')
    
    // Return cleanup function
    return () => {
      console.log('WebGIS component unmounted')
    }
  }, [layers.length])
  
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Village[]>([])
  const [mapMode, setMapMode] = useState<'satellite' | 'terrain' | 'hybrid'>('satellite')
  const mapRef = useRef<HTMLDivElement>(null)

  // Handle search input changes with debounce for better performance
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    
    // Clear previous timeout
    if (typeof window !== 'undefined' && (window as any).searchTimeout) {
      clearTimeout((window as any).searchTimeout)
    }
    
    // Set new timeout for debounced search
    (window as any).searchTimeout = setTimeout(() => {
      if (query.trim()) {
        const results = searchVillages(query)
        setSearchResults(results)
      } else {
        setSearchResults([])
      }
    }, 300) // 300ms debounce
  }
  
  // Handle village selection from search
  const handleVillageSelect = (village: Village) => {
    centerOnVillage(village)
    setSearchQuery(village.name)
    setSearchResults([])
  }
  
  // Handle export functionality
  const handleExportMap = async () => {
    try {
      await exportMapData('geojson')
    } catch (error) {
      console.error('Export failed:', error)
    }
  }
  
  // Get layer icon based on category
  const getLayerIcon = (category: string) => {
    switch (category) {
      case 'satellite': return <Satellite className="w-4 h-4" />
      case 'fra': return <MapPin className="w-4 h-4" />
      case 'analysis': return <TreePine className="w-4 h-4" />
      case 'base': return <Mountain className="w-4 h-4" />
      default: return <Layers className="w-4 h-4" />
    }
  }

  // Track analytics for map interactions
  const [analytics, setAnalytics] = useState({
    zoomLevel: mapState.zoom || 6,
    visibleFeatures: Object.values(geoFeatures).flat().length,
    lastInteraction: new Date(),
    userActions: [] as {action: string, timestamp: Date}[]
  });
  
  // Track analytics for map interactions
  const trackMapInteraction = (action: string) => {
    setAnalytics(prev => ({
      ...prev,
      lastInteraction: new Date(),
      userActions: [...prev.userActions.slice(-9), {action, timestamp: new Date()}]
    }));
  };
  
  // Using icons already imported at the top of the file
  
  // Update analytics when layers or features change
  useEffect(() => {
    setAnalytics(prev => ({
      ...prev,
      visibleFeatures: Object.values(geoFeatures).flat().length,
      zoomLevel: mapState.zoom || 6
    }));
  }, [geoFeatures, mapState.zoom]);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            WebGIS & Satellite Analysis
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Interactive mapping platform with satellite imagery analysis for Forest Rights Act implementation
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-6 lg:mt-0">
          <Button variant="outline" size="sm" onClick={handleExportMap} disabled={isLoading} className="hover:bg-blue-50 hover:text-blue-700 transition-all">
            <Download className="w-4 h-4 mr-2" />
            Export Map
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setIsFullscreen(!isFullscreen);
              trackMapInteraction('toggle_fullscreen');
            }}
            className="hover:bg-blue-50 hover:text-blue-700 transition-all"
          >
            <Maximize2 className="w-4 h-4 mr-2" />
            Fullscreen
          </Button>
        </div>
      </div>

      {/* Layout with Collapsible Sidebar + Full Map */}
      <div className="flex gap-0 relative">
        {/* Analytics Floating Panel */}
        <div className="absolute top-4 right-4 z-10 w-64 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4" />
                <h3 className="text-sm font-medium">Map Analytics</h3>
              </div>
              <Badge className="bg-white/20 hover:bg-white/30 text-white text-xs">Live</Badge>
            </div>
          </div>
          <div className="p-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 p-2 rounded">
                <div className="text-xs text-blue-600 font-medium flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  Features
                </div>
                <div className="text-lg font-bold text-blue-800">{analytics.visibleFeatures}</div>
              </div>
              <div className="bg-indigo-50 p-2 rounded">
                <div className="text-xs text-indigo-600 font-medium flex items-center gap-1">
                  <ZoomIn className="w-3 h-3" />
                  Zoom
                </div>
                <div className="text-lg font-bold text-indigo-800">{analytics.zoomLevel.toFixed(1)}</div>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-700 flex items-center gap-1">
                <Activity className="w-3 h-3 text-gray-600" />
                Recent Activity
              </div>
              <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                {analytics.userActions.length > 0 ? (
                  [...analytics.userActions].reverse().slice(0, 3).map((action, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-1.5 bg-white rounded border border-gray-100">
                      <span className="font-medium capitalize">
                        {action.action.replace('_', ' ')}
                      </span>
                      <span className="text-gray-500 text-[10px]">
                        {action.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-xs text-gray-500 py-1">
                    No activity yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-gray-600" />
                <h2 className="text-sm font-medium text-gray-900">Map Layers</h2>
              </div>
              <Badge variant="secondary" className="text-xs">
                {getVisibleLayers().length} active
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">Manage data layers and visualization</p>
          </div>

          {/* Sidebar Content */}
          <div className="p-4 space-y-6">
            {/* Enhanced Layer controls with visual indicators */}
            <div className="space-y-6">
              {/* Base Layers Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center">
                    <Map className="w-3.5 h-3.5 mr-1.5 text-gray-600" />
                    BASE LAYERS
                  </h3>
                  <Badge variant="outline" className="text-xs py-0 h-5">
                    {getLayersByCategory('base').filter(layer => layer.visible).length}/{getLayersByCategory('base').length}
                  </Badge>
                </div>
                <div className="space-y-4">
                  {getLayersByCategory('base').map((layer) => (
                    <div key={layer.id} className={`rounded-md p-2 transition-colors ${layer.visible ? 'bg-blue-50/70' : 'hover:bg-gray-50'}`}>
                      <div className="flex items-start gap-3">
                        {getLayerIcon(layer.category)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">{layer.name}</span>
                            <div className="flex items-center gap-2">
                              {layer.visible && (
                                <div className="flex items-center gap-1.5">
                                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                                  <span className="text-xs font-medium text-blue-600">Visible</span>
                                </div>
                              )}
                              <Switch 
                                checked={layer.visible} 
                                onCheckedChange={() => toggleLayer(layer.id)} 
                                className="data-[state=checked]:bg-blue-600"
                              />
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{layer.description}</p>
                          
                          {/* Opacity Control - Always visible */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Opacity</span>
                              <span className="text-gray-700">{layer.opacity}%</span>
                            </div>
                            <div className="relative">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={layer.opacity}
                                onChange={(e) => updateLayerOpacity(layer.id, parseInt(e.target.value))}
                                className="w-full opacity-slider accent-blue-600"
                                style={{
                                  background: `linear-gradient(to right, ${layer.color} 0%, ${layer.color} ${layer.opacity}%, #e5e7eb ${layer.opacity}%, #e5e7eb 100%)`
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FRA Data Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center">
                    <TreePine className="w-3.5 h-3.5 mr-1.5 text-green-600" />
                    FRA DATA
                  </h3>
                  <Badge variant="outline" className="text-xs py-0 h-5">
                    {getLayersByCategory('fra').concat(getLayersByCategory('analysis')).filter(layer => layer.visible).length}/
                    {getLayersByCategory('fra').concat(getLayersByCategory('analysis')).length}
                  </Badge>
                </div>
                <div className="space-y-4">
                  {getLayersByCategory('fra').concat(getLayersByCategory('analysis')).map((layer) => (
                    <div key={layer.id} className={`rounded-md p-2 transition-colors ${layer.visible ? 'bg-blue-50/70' : 'hover:bg-gray-50'}`}>
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-4 h-4 rounded-full mt-0.5 flex-shrink-0" 
                          style={{ backgroundColor: layer.color }}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">{layer.name}</span>
                            <div className="flex items-center gap-2">
                              {layer.visible && (
                                <div className="flex items-center gap-1.5">
                                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                                  <span className="text-xs font-medium text-blue-600">Visible</span>
                                </div>
                              )}
                              <Switch 
                                checked={layer.visible} 
                                onCheckedChange={() => toggleLayer(layer.id)} 
                                className="data-[state=checked]:bg-blue-600"
                              />
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{layer.description}</p>
                          
                          {/* Feature Count Display */}
                          {geoFeatures[layer.id] && (
                            <div className="mb-2">
                              <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">
                                {geoFeatures[layer.id].length} features
                              </span>
                            </div>
                          )}
                          
                          {/* Opacity Control - Always visible */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Opacity</span>
                              <span className="text-gray-700">{layer.opacity}%</span>
                            </div>
                            <div className="relative">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={layer.opacity}
                                onChange={(e) => updateLayerOpacity(layer.id, parseInt(e.target.value))}
                                className="w-full opacity-slider accent-blue-600"
                                style={{
                                  background: `linear-gradient(to right, ${layer.color} 0%, ${layer.color} ${layer.opacity}%, #e5e7eb ${layer.opacity}%, #e5e7eb 100%)`
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Search Box - Bottom of sidebar */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border relative">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search villages or districts..."
                  className="flex-1 bg-transparent text-sm placeholder-gray-400 border-none outline-none transition-all duration-200 hover:bg-white/90"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                {searchQuery && (
                  <button 
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => {
                      setSearchQuery('')
                      setSearchResults([])
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {searchResults.length > 0 && (
                <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-sm max-h-40 overflow-y-auto">
                  {searchResults.map((village) => (
                    <button
                      key={village.id}
                      onClick={() => handleVillageSelect(village)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg flex items-center gap-2 transition-colors"
                    >
                      <MapPin className="w-3 h-3 text-blue-500 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium">{village.name}</div>
                        <div className="text-xs text-gray-500">{village.district}, {village.state}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {searchQuery && searchResults.length === 0 && (
                <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-sm py-3 px-4 text-center text-sm text-gray-500">
                  No villages found matching "{searchQuery}"
                </div>
              )}
            </div>
            
            {/* Compact Color Legend for State Boundaries */}
            {getVisibleLayers().some(layer => layer.id === 'state_boundaries') && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Tribal Population</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-900 rounded"></div>
                    <span className="text-gray-700">Very High (&gt;25%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-600 rounded"></div>
                    <span className="text-gray-700">High (15-25%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded"></div>
                    <span className="text-gray-700">Medium (5-15%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-gray-700">Low (&lt;5%)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Map Area */}
        <div className="flex-1 min-w-0">
          <div className="relative h-[calc(100vh-200px)] bg-gray-100">
            <InteractiveMap
              center={mapState.center}
              zoom={mapState.zoom}
              layers={layers}
              geoFeatures={geoFeatures}
              selectedVillage={selectedVillage}
              onFeatureClick={onFeatureClick}
              onMapClick={(latlng) => {
                console.log('Map clicked at:', latlng.lat, latlng.lng)
              }}
              onDistrictClick={(district) => {
                console.log('District clicked:', district)
              }}
              onBoundsChange={updateMapBounds}
              className="w-full h-full"
            />
            
            {/* Map Controls Overlay */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => updateMapState({ zoom: Math.min((mapState.zoom || 6) + 1, 18) })}
                className="w-8 h-8 p-0 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50"
              >
                <ZoomIn className="w-4 h-4 text-gray-600" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => updateMapState({ zoom: Math.max((mapState.zoom || 6) - 1, 1) })}
                className="w-8 h-8 p-0 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50"
              >
                <ZoomOut className="w-4 h-4 text-gray-600" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetMapView}
                className="w-8 h-8 p-0 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50"
                title="Reset View"
              >
                <RotateCcw className="w-3 h-3 text-gray-600" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature/Village Information Panel */}
      {(selectedFeature || selectedVillage) && (
        <Card className="animate-slide-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {selectedVillage?.name || selectedFeature?.properties.name || 'Selected Feature'}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearSelections}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <CardDescription>
              {selectedVillage ? 
                `${selectedVillage.district}, ${selectedVillage.state}` :
                'Feature information and analysis'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedVillage ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{selectedVillage.population}</div>
                    <div className="text-sm text-gray-600">Total Population</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{selectedVillage.tribalPopulation}</div>
                    <div className="text-sm text-gray-600">Tribal Population</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{selectedVillage.forestCover}%</div>
                    <div className="text-sm text-gray-600">Forest Cover</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{selectedVillage.waterIndex}</div>
                    <div className="text-sm text-gray-600">Water Index</div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Geographic Analysis</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Coordinates</span>
                        <span className="text-sm font-medium">
                          {selectedVillage.coordinates[1].toFixed(4)}°N, {selectedVillage.coordinates[0].toFixed(4)}°E
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tribal Percentage</span>
                        <span className="text-sm font-medium">
                          {((selectedVillage.tribalPopulation / selectedVillage.population) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Infrastructure Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Water Access</span>
                        <Badge variant={selectedVillage.waterIndex > 60 ? 'default' : 'secondary'}>
                          {selectedVillage.waterIndex > 60 ? 'Good' : 'Needs Improvement'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Forest Connectivity</span>
                        <Badge variant={selectedVillage.forestCover > 70 ? 'default' : 'secondary'}>
                          {selectedVillage.forestCover > 70 ? 'High' : 'Moderate'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : selectedFeature ? (
              <div>
                <h4 className="font-semibold mb-3">Feature Properties</h4>
                <div className="space-y-2">
                  {Object.entries(selectedFeature.properties).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-sm font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Enhanced Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Active Layers",
            value: getVisibleLayers().length.toString(), 
            subtitle: `of ${layers.length} total layers`,
            icon: <Layers className="w-6 h-6" />,
            color: "blue"
          },
          {
            title: "Map Features",
            value: Object.values(geoFeatures).flat().length.toString(),
            subtitle: "features loaded",
            icon: <MapPin className="w-6 h-6" />,
            color: "green"
          },
          {
            title: "Selected Village",
            value: selectedVillage ? "1" : "0",
            subtitle: selectedVillage ? selectedVillage.name : "None selected",
            icon: <Home className="w-6 h-6" />,
            color: "orange"
          },
          {
            title: "Map Zoom",
            value: (mapState.zoom || 6).toString(),
            subtitle: "current zoom level",
            icon: <Search className="w-6 h-6" />,
            color: "purple"
          }
        ].map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.subtitle}</p>
                </div>
                <div className={`p-3 rounded-xl bg-${stat.color}-100 text-${stat.color}-600`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDSS } from "@/hooks/useDSS"
import type { Scheme } from "@/types"
import { mockVillages } from "@/services/mockData"
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  IndianRupee, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Lightbulb,
  BarChart3,
  MapPin,
  Download,
  RefreshCw,
  Zap,
  Award,
  Home,
  Droplets,
  Tractor,
  Heart,
  ChevronRight,
  Filter
} from "lucide-react"

export function DecisionSupport() {
  const {
    isAnalyzing,
    analysisProgress,
    recommendations,
    convergenceOpportunities,
    priorityActions,
    lastAnalysis,
    confidence,
    filters,
    selectedSchemes,
    runAnalysis,
    resetAnalysis,
    getFilteredSchemes,
    updateFilters,
    toggleSchemeSelection,
    getSchemeStatistics,
    exportAnalysis
  } = useDSS()
  
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedVillage, setSelectedVillage] = useState<string>("village_1")

  // Handle running AI analysis for selected village
  const handleRunAnalysis = async () => {
    try {
      await runAnalysis(selectedVillage)
    } catch (error) {
      console.error('Analysis failed:', error)
    }
  }
  
  // Handle export functionality
  const handleExportAnalysis = async () => {
    try {
      await exportAnalysis('json')
    } catch (error) {
      console.error('Export failed:', error)
    }
  }
  
  // Get filtered schemes for display
  const filteredSchemes = getFilteredSchemes()
  const statistics = getSchemeStatistics()
  const getSchemeIcon = (category: string) => {
    switch (category) {
      case 'agriculture': return <Tractor className="w-5 h-5" />
      case 'infrastructure': return <Home className="w-5 h-5" />
      case 'welfare': return <Heart className="w-5 h-5" />
      case 'livelihood': return <Users className="w-5 h-5" />
      default: return <Target className="w-5 h-5" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-orange-600 bg-orange-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recommended': return 'text-blue-600 bg-blue-100'
      case 'eligible': return 'text-green-600 bg-green-100'
      case 'applied': return 'text-orange-600 bg-orange-100'
      case 'approved': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-600" />
            AI-Powered Decision Support
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Intelligent government scheme recommendations and convergence opportunities for tribal welfare optimization
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-6 lg:mt-0">
          <select 
            value={selectedVillage}
            onChange={(e) => setSelectedVillage(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 hover:border-purple-300 transition-colors"
          >
            {mockVillages.map(village => (
              <option key={village.id} value={village.id}>
                {village.name}, {village.state}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={handleRunAnalysis} disabled={isAnalyzing} className="hover:bg-purple-50 hover:text-purple-700 transition-all">
            {isAnalyzing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
            {isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-colors" onClick={handleExportAnalysis}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* AI Analysis Progress */}
      {isAnalyzing && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center animate-pulse">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-purple-900">AI Analysis in Progress</h3>
                <p className="text-sm text-purple-700 mb-2">Processing beneficiary data and scheme compatibility...</p>
                <Progress value={analysisProgress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Total Schemes",
            value: statistics.total.toString(),
            change: "+12%",
            icon: <Target className="w-6 h-6" />,
            color: "blue"
          },
          {
            title: "Avg AI Score",
            value: `${statistics.avgAIScore.toFixed(1)}%`,
            change: "+8.3%",
            icon: <Brain className="w-6 h-6" />,
            color: "green"
          },
          {
            title: "Total Benefits",
            value: `₹${(statistics.totalBenefit / 100000).toFixed(1)} L`,
            change: "+25%",
            icon: <IndianRupee className="w-6 h-6" />,
            color: "purple"
          },
          {
            title: "Analysis Confidence",
            value: `${confidence || 0}%`,
            change: "+2.1%",
            icon: <Award className="w-6 h-6" />,
            color: "cyan"
          }
        ].map((metric, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <div className="flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                    <span className="text-xs font-semibold text-green-600">{metric.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-${metric.color}-100 text-${metric.color}-600`}>
                  {metric.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="schemes" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Schemes
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            AI Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* AI Recommendations */}
          <Card className="border-purple-200 shadow-md hover:shadow-xl transition-all">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-white">
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                AI-Powered Recommendations
              </CardTitle>
              <CardDescription>Intelligent insights for scheme optimization and convergence</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {convergenceOpportunities.map((rec, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white hover:bg-purple-50">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-purple-100 text-purple-700 shadow-sm">{rec.type}</Badge>
                      <Badge variant={rec.priority === 'high' ? 'default' : 'secondary'} className="shadow-sm">
                        {rec.priority} Priority
                      </Badge>
                    </div>
                    <h4 className="font-semibold mb-2 text-purple-900">{rec.title}</h4>
                    <p className="text-sm text-gray-600 mb-4">{rec.description}</p>
                    <div className="space-y-2 text-xs bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-gray-600 flex items-center gap-1"><Users className="w-3 h-3" />Beneficiaries:</span>
                        <span className="font-medium">{rec.beneficiaryCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 flex items-center gap-1"><IndianRupee className="w-3 h-3" />Investment:</span>
                        <span className="font-medium">₹{(rec.estimatedCost / 100000).toFixed(1)}L</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 flex items-center gap-1"><Award className="w-3 h-3" />Confidence:</span>
                        <span className="font-medium text-purple-600">{rec.confidence}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Scheme Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Scheme Performance Matrix
              </CardTitle>
              <CardDescription>Coverage and effectiveness analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Coverage by Category</h4>
                  <div className="space-y-3">
                    {[
                      { category: 'Agriculture', coverage: statistics.byCategory.agriculture * 20, schemes: statistics.byCategory.agriculture },
                      { category: 'Infrastructure', coverage: statistics.byCategory.infrastructure * 15, schemes: statistics.byCategory.infrastructure },
                      { category: 'Welfare', coverage: statistics.byCategory.welfare * 25, schemes: statistics.byCategory.welfare },
                      { category: 'Livelihood', coverage: statistics.byCategory.livelihood * 18, schemes: statistics.byCategory.livelihood }
                    ].map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{item.category}</span>
                          <span className="text-sm text-gray-600">{item.coverage}% ({item.schemes} schemes)</span>
                        </div>
                        <Progress value={item.coverage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Priority Distribution</h4>
                  <div className="space-y-3">
                    {[
                      { range: 'High Priority', count: statistics.byPriority.high, color: 'red' },
                      { range: 'Medium Priority', count: statistics.byPriority.medium, color: 'orange' },
                      { range: 'Low Priority', count: statistics.byPriority.low, color: 'green' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-lg border">
                        <span className="text-sm font-medium">{item.range}</span>
                        <Badge className={`bg-${item.color}-100 text-${item.color}-700`}>
                          {item.count} schemes
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schemes" className="space-y-6">
          {/* Scheme Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Filter by category:</span>
                  <select 
                    value={filters.category}
                    onChange={(e) => updateFilters({ category: e.target.value as any })}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="agriculture">Agriculture</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="welfare">Welfare</option>
                    <option value="livelihood">Livelihood</option>
                  </select>
                </div>
                <Badge variant="secondary" className="ml-auto">
                  {filteredSchemes.length} schemes available
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Scheme Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSchemes.map((scheme: Scheme) => (
              <Card key={scheme.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {getSchemeIcon(scheme.category)}
                      {scheme.name}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(scheme.priority)}>
                        {scheme.priority}
                      </Badge>
                      <Badge className={getStatusColor(scheme.status)}>
                        {scheme.status}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{scheme.ministry}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Brain className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">AI Compatibility Score</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={scheme.aiCompatibilityScore} className="w-20 h-2" />
                      <span className="text-sm font-bold text-purple-600">{scheme.aiCompatibilityScore}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-sm text-gray-600">Eligibility</div>
                      <div className="font-semibold text-green-600">{scheme.eligibilityScore}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Budget</div>
                      <div className="font-semibold text-blue-600">₹{(scheme.budgetAllocation / 1000).toFixed(0)}K</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Coverage</div>
                      <div className="font-semibold text-orange-600">{scheme.coveragePercentage}%</div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold mb-2">Key Benefits:</h5>
                    <div className="space-y-1">
                      {scheme.benefits.slice(0, 3).map((benefit: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <Award className="w-4 h-4 inline mr-1" />
                        Impact: {scheme.description.split(' ').slice(0, 4).join(' ')}...
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant={selectedSchemes.includes(scheme.id) ? "default" : "outline"} 
                          size="sm"
                          onClick={() => toggleSchemeSelection(scheme.id)}
                        >
                          {selectedSchemes.includes(scheme.id) ? 'Selected' : 'Select'}
                        </Button>
                        <Button variant="outline" size="sm">
                          View Details
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Convergence Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Scheme Convergence
                </CardTitle>
                <CardDescription>Opportunities for multi-scheme integration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {convergenceOpportunities.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex flex-wrap gap-1">
                        {item.schemes.map((scheme, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {scheme}
                          </Badge>
                        ))}
                      </div>
                      <Badge className="bg-green-100 text-green-700">
                        {item.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                    <div className="text-xs text-gray-500">
                      {item.beneficiaryCount.toLocaleString()} potential beneficiaries
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Priority Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Priority Actions
                </CardTitle>
                <CardDescription>Immediate recommendations for implementation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {priorityActions.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-sm">{item.title}</h5>
                      <Badge variant={item.priority === 'high' ? 'destructive' : 'secondary'}>
                        {item.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      Confidence: {item.confidence}% | Impact: {item.expectedImpact}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Wand2,
  Image,
  FileSpreadsheet,
  TrendingUp,
  MessageSquare,
  Sparkles,
  Zap,
  Lock,
  Clock,
  CheckCircle2,
  ArrowRight,
  Brain,
  Camera,
  Bot,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { api, type AIFeatureResponse, type AIIntegrationResponse } from '@/lib/api'

const statusConfig = {
  coming_soon: { label: 'Coming Soon', color: 'bg-slate-100 text-slate-700', icon: Clock },
  in_development: { label: 'In Development', color: 'bg-blue-100 text-blue-700', icon: Zap },
  beta: { label: 'Beta', color: 'bg-amber-100 text-amber-700', icon: Sparkles },
  available: { label: 'Available', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
}

const iconByKey: Record<string, LucideIcon> = {
  image: Image,
  file_spreadsheet: FileSpreadsheet,
  trending_up: TrendingUp,
  message_square: MessageSquare,
  wand: Wand2,
}

export function AIFeatures() {
  const [features, setFeatures] = useState<AIFeatureResponse[]>([])
  const [integrations, setIntegrations] = useState<AIIntegrationResponse[]>([])
  const [prompt, setPrompt] = useState('')
  const [demoOutput, setDemoOutput] = useState('')

  useEffect(() => {
    void api
      .getAIRoadmap()
      .then((data) => {
        setFeatures(data.features || [])
        setIntegrations(data.integrations || [])
      })
      .catch(() => {
        setFeatures([])
        setIntegrations([])
      })
  }, [])

  const nextMilestone = useMemo(
    () => features.find((feature) => feature.expectedDate)?.expectedDate,
    [features]
  )

  const handleDemoGenerate = () => {
    if (!prompt.trim()) {
      setDemoOutput('Enter a decor brief to generate a preview summary.')
      return
    }
    setDemoOutput(`Preview generated for: "${prompt.trim()}". Save this brief and use upcoming AI generation when released.`)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-gradient-to-br from-gold-50 via-white to-gold-50 border-gold-200">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg">
              <Brain className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">AI-Powered Future</h2>
              <p className="mt-1 text-sm sm:text-base text-muted-foreground">
                Transform your wedding decor operations with data-backed AI capabilities.
              </p>
            </div>
            <Badge className="bg-gold-100 text-gold-700 text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Phase 3 Roadmap
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {features.map((feature) => {
          const StatusIcon = statusConfig[feature.status].icon
          const FeatureIcon = iconByKey[feature.iconKey] || Sparkles
          return (
            <Card key={feature.id} className="relative overflow-hidden">
              {feature.status !== 'available' && (
                <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8">
                  <div className="absolute transform rotate-45 bg-gradient-to-r from-gold-400 to-gold-500 text-white text-[10px] font-bold py-1 right-[-35px] top-[32px] w-[170px] text-center shadow-sm">
                    COMING SOON
                  </div>
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-100">
                    <FeatureIcon className="h-6 w-6 text-gold-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base font-semibold">{feature.title}</CardTitle>
                      <Badge className={cn('text-[10px]', statusConfig[feature.status].color)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[feature.status].label}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Development Progress</span>
                    <span className="font-medium">{feature.progress}%</span>
                  </div>
                  <Progress value={feature.progress} className="h-2" />
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Key Benefits</p>
                  <ul className="space-y-1">
                    {feature.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {feature.expectedDate && (
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-sm text-muted-foreground">Expected</span>
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {feature.expectedDate}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}

        {features.length === 0 && (
          <Card className="md:col-span-2">
            <CardContent className="p-6 text-sm text-muted-foreground">
              No AI roadmap records found in the database yet.
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-gold-500" />
            Future Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {integrations.map((integration) => {
              const IntegrationIcon = iconByKey[integration.iconKey] || Sparkles
              return (
                <div
                  key={integration.id}
                  className="flex items-center gap-3 rounded-xl border border-dashed border-border p-4 bg-muted/30"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <IntegrationIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{integration.name}</p>
                    <p className="text-xs text-muted-foreground">{integration.status}</p>
                  </div>
                  <Lock className="h-4 w-4 text-muted-foreground/50" />
                </div>
              )
            })}
          </div>
          {integrations.length === 0 && (
            <p className="text-sm text-muted-foreground mt-3">No integration roadmap records found in the database.</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <Bot className="h-8 w-8 text-gold-400" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-semibold">Want Early Access?</h3>
              <p className="mt-1 text-sm text-slate-300">
                Join our beta program to test upcoming AI features and provide feedback.
              </p>
            </div>
            <Button
              className="bg-gold-500 hover:bg-gold-600 text-white"
              onClick={() => {
                window.location.href = 'mailto:beta@tiein.app?subject=AI%20Beta%20Program%20Request'
              }}
            >
              Join Beta Program
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Camera className="h-5 w-5 text-gold-500" />
            Preview: AI Design Generator (Demo)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-100">
                <Wand2 className="h-8 w-8 text-gold-600" />
              </div>
            </div>
            <h4 className="text-lg font-semibold mb-2">AI Design Generator</h4>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Describe your theme and budget, then generate reference decor concepts.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-lg mx-auto">
              <input
                type="text"
                placeholder="e.g., Royal mandap with white orchids and gold accents..."
                className="flex-1 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <Button className="w-full sm:w-auto" onClick={handleDemoGenerate}>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate
              </Button>
            </div>
            {demoOutput && <p className="text-xs text-muted-foreground mt-3">{demoOutput}</p>}
            <p className="text-xs text-muted-foreground mt-4">
              {nextMilestone
                ? `This feature will be available as per roadmap (${nextMilestone})`
                : 'This feature will be available as per roadmap updates.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

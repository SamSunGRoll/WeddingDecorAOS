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
  Calculator,
  Bot,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AIFeature {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  status: 'coming_soon' | 'in_development' | 'beta' | 'available'
  progress: number
  benefits: string[]
  expectedDate?: string
}

const aiFeatures: AIFeature[] = [
  {
    id: 'ai-design',
    title: 'AI-Generated Décor Designs',
    description: 'Generate stunning décor designs based on theme, budget, and venue type using advanced AI models.',
    icon: Image,
    status: 'in_development',
    progress: 65,
    benefits: [
      'Generate designs in seconds',
      'Theme & budget aware suggestions',
      'Multiple style variations',
      'Export to design library',
    ],
    expectedDate: 'Q3 2024',
  },
  {
    id: 'ai-costing',
    title: 'Auto-Fill Cost Sheets',
    description: 'Upload reference images and let AI automatically identify elements and generate cost estimates.',
    icon: FileSpreadsheet,
    status: 'coming_soon',
    progress: 35,
    benefits: [
      'Image recognition for décor elements',
      'Automatic material estimation',
      'Price suggestions from history',
      '80% faster costing',
    ],
    expectedDate: 'Q4 2024',
  },
  {
    id: 'ai-prediction',
    title: 'Material Wastage Prediction',
    description: 'AI predicts material wastage, overuse, and cost risks based on historical data and event parameters.',
    icon: TrendingUp,
    status: 'coming_soon',
    progress: 20,
    benefits: [
      'Reduce wastage by 25-30%',
      'Risk alerts before procurement',
      'Optimize ordering quantities',
      'Cost savings insights',
    ],
    expectedDate: 'Q1 2025',
  },
  {
    id: 'ai-assistant',
    title: 'Conversational AI Assistant',
    description: 'Chat with an AI assistant to get instant answers, create estimates, and manage workflows.',
    icon: MessageSquare,
    status: 'coming_soon',
    progress: 10,
    benefits: [
      'Natural language queries',
      'Voice-enabled commands',
      'WhatsApp integration',
      '24/7 availability',
    ],
    expectedDate: 'Q2 2025',
  },
]

const statusConfig = {
  coming_soon: { label: 'Coming Soon', color: 'bg-slate-100 text-slate-700', icon: Clock },
  in_development: { label: 'In Development', color: 'bg-blue-100 text-blue-700', icon: Zap },
  beta: { label: 'Beta', color: 'bg-amber-100 text-amber-700', icon: Sparkles },
  available: { label: 'Available', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
}

const futureIntegrations = [
  { name: 'WhatsApp Business', icon: MessageSquare, status: 'Planned' },
  { name: 'Canva Integration', icon: Image, status: 'Planned' },
  { name: 'Google Sheets Sync', icon: FileSpreadsheet, status: 'Planned' },
  { name: 'Accounting Software', icon: Calculator, status: 'Planned' },
]

export function AIFeatures() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Section */}
      <Card className="bg-gradient-to-br from-gold-50 via-white to-gold-50 border-gold-200">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg">
              <Brain className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">AI-Powered Future</h2>
              <p className="mt-1 text-sm sm:text-base text-muted-foreground">
                Transform your wedding décor operations with cutting-edge AI capabilities.
                Here's what's coming in Phase 3.
              </p>
            </div>
            <Badge className="bg-gold-100 text-gold-700 text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Phase 3 Roadmap
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* AI Features Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {aiFeatures.map((feature) => {
          const StatusIcon = statusConfig[feature.status].icon
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
                    <feature.icon className="h-6 w-6 text-gold-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base font-semibold">{feature.title}</CardTitle>
                      <Badge className={cn("text-[10px]", statusConfig[feature.status].color)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[feature.status].label}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Development Progress</span>
                    <span className="font-medium">{feature.progress}%</span>
                  </div>
                  <Progress value={feature.progress} className="h-2" />
                </div>

                {/* Benefits */}
                <div>
                  <p className="text-sm font-medium mb-2">Key Benefits</p>
                  <ul className="space-y-1">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Expected Date */}
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
      </div>

      {/* Future Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-gold-500" />
            Future Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {futureIntegrations.map((integration) => (
              <div
                key={integration.name}
                className="flex items-center gap-3 rounded-xl border border-dashed border-border p-4 bg-muted/30"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <integration.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{integration.name}</p>
                  <p className="text-xs text-muted-foreground">{integration.status}</p>
                </div>
                <Lock className="h-4 w-4 text-muted-foreground/50" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <Bot className="h-8 w-8 text-gold-400" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-semibold">Want Early Access?</h3>
              <p className="mt-1 text-sm text-slate-300">
                Join our beta program to get early access to AI features and help shape the future of wedding décor operations.
              </p>
            </div>
            <Button className="bg-gold-500 hover:bg-gold-600 text-white">
              Join Beta Program
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Demo AI Feature */}
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
              Describe your dream wedding décor and let AI create stunning design concepts for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-lg mx-auto">
              <input
                type="text"
                placeholder="e.g., Royal mandap with white orchids and gold accents..."
                className="flex-1 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                disabled
              />
              <Button disabled className="w-full sm:w-auto">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              This feature will be available in Q3 2024
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

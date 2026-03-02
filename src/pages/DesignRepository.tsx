import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Copy,
  Heart,
  Eye,
  IndianRupee,
  Calendar,
  Tag,
  Image as ImageIcon,
} from 'lucide-react'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import type { Design } from '@/types'
import { api } from '@/lib/api'

export function DesignRepository() {
  const [designs, setDesigns] = useState<Design[]>([])
  const [themes, setThemes] = useState<string[]>([])
  const [venueTypes, setVenueTypes] = useState<string[]>([])
  const [colorPalettes, setColorPalettes] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTheme, setSelectedTheme] = useState<string>('all')
  const [selectedVenue, setSelectedVenue] = useState<string>('all')
  const [selectedColor, setSelectedColor] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [duplicateMessage, setDuplicateMessage] = useState('')

  const loadDesigns = () => {
    return Promise.all([api.getDesigns(), api.getMeta()])
      .then(([designsData, meta]) => {
        setDesigns(designsData)
        setThemes(meta.themes || [])
        setVenueTypes(meta.venueTypes || [])
        setColorPalettes(meta.colorPalettes || [])
      })
      .catch(() => {
        setDesigns([])
        setThemes([])
        setVenueTypes([])
        setColorPalettes([])
      })
  }

  useEffect(() => {
    void loadDesigns()
  }, [])

  const filteredDesigns = designs.filter((design) => {
    const matchesSearch =
      searchQuery === '' ||
      design.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      design.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesTheme = selectedTheme === 'all' || design.theme === selectedTheme
    const matchesVenue = selectedVenue === 'all' || design.venueType === selectedVenue
    const matchesColor =
      selectedColor === 'all' || design.colors.includes(selectedColor.toLowerCase())

    return matchesSearch && matchesTheme && matchesVenue && matchesColor
  })

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(id)) {
      newFavorites.delete(id)
    } else {
      newFavorites.add(id)
    }
    setFavorites(newFavorites)
  }

  const handleDuplicate = async (designId: string) => {
    setDuplicateMessage('')
    try {
      const duplicated = await api.duplicateDesign(designId)
      await loadDesigns()
      setDuplicateMessage(`Duplicated as "${duplicated.name}".`)
    } catch {
      setDuplicateMessage('Could not duplicate design.')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search & Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search designs, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedTheme} onValueChange={setSelectedTheme}>
            <SelectTrigger className="w-[160px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Themes</SelectItem>
              {themes.map((theme) => (
                <SelectItem key={theme} value={theme}>
                  {theme}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedVenue} onValueChange={setSelectedVenue}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Venue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Venues</SelectItem>
              {venueTypes.map((venue) => (
                <SelectItem key={venue} value={venue}>
                  {venue}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedColor} onValueChange={setSelectedColor}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Color" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Colors</SelectItem>
              {colorPalettes.map((color) => (
                <SelectItem key={color} value={color} className="capitalize">
                  {color}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center rounded-xl border bg-muted p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon-sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon-sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filteredDesigns.length}</span> designs
        </p>
      </div>
      {duplicateMessage && <p className="text-sm text-muted-foreground">{duplicateMessage}</p>}

      {/* Design Grid */}
      {viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDesigns.map((design) => (
            <Card
              key={design.id}
              className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg"
              onClick={() => setSelectedDesign(design)}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={design.imageUrl}
                  alt={design.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      void handleDuplicate(design.id)
                    }}
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    Duplicate
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(design.id)
                    }}
                  >
                    <Heart
                      className={cn(
                        'h-4 w-4',
                        favorites.has(design.id) && 'fill-red-500 text-red-500'
                      )}
                    />
                  </Button>
                </div>
                <Badge
                  variant="gold"
                  className="absolute right-3 top-3 shadow-sm"
                >
                  {formatCurrency(design.budget)}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold leading-tight">{design.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{design.theme}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {design.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>Used {design.usageCount}x</span>
                  </div>
                  <span>{design.venueType}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDesigns.map((design) => (
            <Card
              key={design.id}
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => setSelectedDesign(design)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl">
                  <img
                    src={design.imageUrl}
                    alt={design.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{design.name}</h3>
                    <Badge variant="gold">{design.theme}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {design.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-semibold text-gold-600">
                    {formatCurrency(design.budget)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {design.venueType}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={(e) => {
                    e.stopPropagation()
                    void handleDuplicate(design.id)
                  }}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(design.id)
                    }}
                  >
                    <Heart
                      className={cn(
                        'h-4 w-4',
                        favorites.has(design.id) && 'fill-red-500 text-red-500'
                      )}
                    />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredDesigns.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 font-semibold">No designs found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your filters or search query
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearchQuery('')
              setSelectedTheme('all')
              setSelectedVenue('all')
              setSelectedColor('all')
            }}
          >
            Clear filters
          </Button>
        </div>
      )}

      {/* Design Detail Modal */}
      <Dialog open={!!selectedDesign} onOpenChange={() => setSelectedDesign(null)}>
        <DialogContent className="max-w-2xl">
          {selectedDesign && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedDesign.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="aspect-video overflow-hidden rounded-xl">
                  <img
                    src={selectedDesign.imageUrl}
                    alt={selectedDesign.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="gold">{selectedDesign.theme}</Badge>
                  {selectedDesign.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                      <IndianRupee className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="font-medium">{formatCurrency(selectedDesign.budget)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Usage Count</p>
                      <p className="font-medium">{selectedDesign.usageCount} times</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                      <Tag className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Venue Type</p>
                      <p className="font-medium">{selectedDesign.venueType}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Used</p>
                      <p className="font-medium">
                        {selectedDesign.lastUsed
                          ? formatDate(selectedDesign.lastUsed)
                          : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Colors</p>
                  <div className="mt-2 flex gap-2">
                    {selectedDesign.colors.map((color) => (
                      <div
                        key={color}
                        className="flex items-center gap-2 rounded-full border px-3 py-1"
                      >
                        <div
                          className="h-3 w-3 rounded-full border"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm capitalize">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedDesign(null)}>
                  Close
                </Button>
                <Button variant="gold" onClick={() => void handleDuplicate(selectedDesign.id)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate Design
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

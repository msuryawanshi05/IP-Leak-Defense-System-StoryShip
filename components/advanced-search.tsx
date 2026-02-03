"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X, Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export interface SearchFilters {
  query: string
  fileType?: string
  status?: "all" | "verified" | "pending"
  dateFrom?: Date
  dateTo?: Date
}

interface AdvancedSearchProps {
  onFiltersChange: (filters: SearchFilters) => void
  initialFilters?: SearchFilters
}

export function AdvancedSearch({ onFiltersChange, initialFilters }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>(
    initialFilters || {
      query: "",
      status: "all",
    },
  )
  const [isOpen, setIsOpen] = useState(false)

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    const updated = { ...filters, [key]: value }
    setFilters(updated)
    onFiltersChange(updated)
  }

  const clearFilters = () => {
    const cleared = {
      query: "",
      status: "all" as const,
    }
    setFilters(cleared)
    onFiltersChange(cleared)
  }

  const hasActiveFilters =
    filters.query ||
    filters.fileType ||
    (filters.status && filters.status !== "all") ||
    filters.dateFrom ||
    filters.dateTo

  return (
    <div className="flex gap-2 items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search files..."
          value={filters.query}
          onChange={(e) => updateFilter("query", e.target.value)}
          className="pl-10"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.ctrlKey) {
              // Ctrl+Enter to focus search
              e.currentTarget.focus()
            }
          }}
        />
      </div>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className={cn(hasActiveFilters && "border-primary")}>
            <Filter className="h-4 w-4" />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filters</h4>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">File Type</label>
                <Select
                  value={filters.fileType || "all"}
                  onValueChange={(v) => updateFilter("fileType", v === "all" ? undefined : v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="document">Documents</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Status</label>
                <Select
                  value={filters.status || "all"}
                  onValueChange={(v: any) => updateFilter("status", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium block">Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "justify-start text-left font-normal",
                          !filters.dateFrom && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateFrom ? (
                          format(filters.dateFrom, "MMM dd")
                        ) : (
                          <span>From</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.dateFrom}
                        onSelect={(date) => updateFilter("dateFrom", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "justify-start text-left font-normal",
                          !filters.dateTo && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateTo ? format(filters.dateTo, "MMM dd") : <span>To</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.dateTo}
                        onSelect={(date) => updateFilter("dateTo", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap gap-1 pt-2 border-t">
                {filters.query && (
                  <Badge variant="secondary" className="text-xs">
                    Query: {filters.query}
                  </Badge>
                )}
                {filters.fileType && (
                  <Badge variant="secondary" className="text-xs">
                    Type: {filters.fileType}
                  </Badge>
                )}
                {filters.status && filters.status !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    Status: {filters.status}
                  </Badge>
                )}
                {filters.dateFrom && (
                  <Badge variant="secondary" className="text-xs">
                    From: {format(filters.dateFrom, "MMM dd")}
                  </Badge>
                )}
                {filters.dateTo && (
                  <Badge variant="secondary" className="text-xs">
                    To: {format(filters.dateTo, "MMM dd")}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}


"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, X, Filter } from "lucide-react"

interface SearchFilterProps {
  onSearch: (query: string) => void
  onFilter: (filters: FilterOptions) => void
  onSort: (sortBy: string) => void
}

export interface FilterOptions {
  type?: string
  dateFrom?: string
  dateTo?: string
  network?: string
  status?: string
}

export default function SearchFilter({ onSearch, onFilter, onSort }: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<FilterOptions>({})
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined }
    setFilters(newFilters)
    onFilter(newFilters)
  }

  const clearFilters = () => {
    setFilters({})
    setSearchQuery("")
    onFilter({})
    onSearch("")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>Find files, IP Assets, and transactions</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? "Hide" : "Show"} Filters
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by file name, hash, IP Asset ID, or transaction hash..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          {(searchQuery || Object.keys(filters).length > 0) && (
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="grid md:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <label className="text-sm font-medium mb-2 block">File Type</label>
              <Select value={filters.type || ""} onValueChange={(value) => handleFilterChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date From</label>
              <Input
                type="date"
                value={filters.dateFrom || ""}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date To</label>
              <Input
                type="date"
                value={filters.dateTo || ""}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={filters.status || ""} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2 border-t">
          <span className="text-sm font-medium">Sort by:</span>
          <Select defaultValue="newest" onValueChange={onSort}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="size">Size</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(searchQuery || Object.keys(filters).length > 0) && (
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Search: {searchQuery}
                <X className="h-3 w-3 cursor-pointer" onClick={() => handleSearch("")} />
              </Badge>
            )}
            {Object.entries(filters).map(([key, value]) =>
              value ? (
                <Badge key={key} variant="secondary" className="gap-1">
                  {key}: {value}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleFilterChange(key as keyof FilterOptions, "")}
                  />
                </Badge>
              ) : null,
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import airports from "@/constants/airports.json"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Airport {
  code: string
  name: string
  city: string
  state: string
  country: string
  lat: string
  lon: string
}

interface CityComboboxProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  className?: string
}

export function CityCombobox({
  value,
  onValueChange,
  placeholder = "Sélectionner une ville...",
  className
}: CityComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  // Filter airports based on search and prioritize Cameroon airports
  const filteredAirports = React.useMemo(() => {
    if (!searchValue || searchValue.trim() === "") {
      // Show popular Cameroon airports by default
      return (airports as Airport[])
        .filter(airport => airport.country === "Cameroon")
        .slice(0, 10)
    }

    const searchTerm = searchValue.toLowerCase().trim()
    
    const filtered = (airports as Airport[])
      .filter(airport => {
        // Search across all relevant fields with null safety
        const searchFields = [
          airport.city?.toLowerCase() || "",
          airport.name?.toLowerCase() || "",
          airport.country?.toLowerCase() || "",
          airport.code?.toLowerCase() || "",
          airport.state?.toLowerCase() || ""
        ]
        
        // Also include some common variations and keywords
        const additionalSearchTerms = [
          // Add alternative spellings for common cities
          airport.city?.toLowerCase() === "yaounde" ? "yaoundé" : "",
          airport.city?.toLowerCase() === "yaoundé" ? "yaounde" : "",
          airport.city?.toLowerCase() === "ngaoundéré" ? "ngaoundere" : "",
          airport.city?.toLowerCase() === "ngaoundere" ? "ngaoundéré" : "",
        ].filter(Boolean)
        
        const allSearchFields = [...searchFields, ...additionalSearchTerms]
        
        // Check if any field contains the search term
        return allSearchFields.some(field => field.includes(searchTerm))
      })
      .slice(0, 100) // Increased limit for better search results

      console.log({filtered})

    // Sort to prioritize matches and Cameroon airports
    return filtered.sort((a, b) => {
      const aIsCameroon = a.country === "Cameroon"
      const bIsCameroon = b.country === "Cameroon"
      
      // First, prioritize exact matches in city name or code
      const aExactCityMatch = a.city?.toLowerCase() === searchTerm || a.code?.toLowerCase() === searchTerm
      const bExactCityMatch = b.city?.toLowerCase() === searchTerm || b.code?.toLowerCase() === searchTerm
      
      if (aExactCityMatch && !bExactCityMatch) return -1
      if (!aExactCityMatch && bExactCityMatch) return 1
      
      // Then prioritize Cameroon airports
      if (aIsCameroon && !bIsCameroon) return -1
      if (!aIsCameroon && bIsCameroon) return 1
      
      // Finally, sort alphabetically by city
      return (a.city || "").localeCompare(b.city || "")
    })
  }, [searchValue])

  const selectedAirport = React.useMemo(() => {
    return (airports as Airport[]).find(airport => 
      `${airport.city}, ${airport.country}` === value || airport.city === value
    )
  }, [value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full h-10 justify-between font-normal", className)}
        >
          {selectedAirport ? (
            <span className="truncate">
              {selectedAirport.city}, {selectedAirport.country}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Rechercher une ville ou aéroport..." 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              {searchValue.trim() ? 
                `Aucun résultat pour "${searchValue.trim()}"` : 
                "Aucun aéroport trouvé."
              }
            </CommandEmpty>
            <CommandGroup>
              {filteredAirports.map((airport) => {
                const airportValue = `${airport.city}, ${airport.country}`
                const isSelected = value === airportValue || value === airport.city
                
                const handleSelect = (e: React.MouseEvent) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const newValue = isSelected ? "" : airport.city
                  onValueChange?.(newValue)
                  setOpen(false)
                  setSearchValue("")
                }
                
                return (
                  <div
                    key={`${airport.code}-${airport.city}`}
                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                    onClick={handleSelect}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{airport.city}</span>
                      <span className="text-sm text-muted-foreground">
                        {airport.name} ({airport.code}) - {airport.country}
                      </span>
                    </div>
                  </div>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

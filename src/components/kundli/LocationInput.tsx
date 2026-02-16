"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface LocationInputProps {
    value: string;
    onChange: (location: string, lat?: number, lng?: number) => void;
    required?: boolean;
}

interface Suggestion {
    description: string;
    place_id: string;
}

export function LocationInput({ value, onChange, required }: LocationInputProps) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceTimer = useRef<any>(null);

    useEffect(() => {
        if (value.length < 3) {
            setSuggestions([]);
            return;
        }

        // Clear previous timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Debounce API calls
        debounceTimer.current = setTimeout(async () => {
            setLoading(true);
            try {
                // Using OpenStreetMap Nominatim (free, no API key required)
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5`
                );
                const data = await response.json();

                setSuggestions(
                    data.map((item: any) => ({
                        description: item.display_name,
                        place_id: item.place_id,
                        lat: parseFloat(item.lat),
                        lng: parseFloat(item.lon)
                    }))
                );
                setShowSuggestions(true);
            } catch (error) {
                console.error("Geocoding error:", error);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [value]);

    const handleSelect = (suggestion: any) => {
        onChange(suggestion.description, suggestion.lat, suggestion.lng);
        setCoordinates({ lat: suggestion.lat, lng: suggestion.lng });
        setShowSuggestions(false);
        setSuggestions([]);
    };

    return (
        <div className="relative">
            <div className="relative">
                <Input
                    ref={inputRef}
                    className="h-16 pl-12 pr-6 bg-primary/5 border-primary/10 rounded-2xl focus:border-primary/50 transition-all font-bold text-lg placeholder:text-foreground/10 text-foreground"
                    placeholder="Search city or location..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required={required}
                    autoComplete="off"
                />
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20" />
                {loading && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-spin" />
                )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-2 glass border border-primary/20 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleSelect(suggestion)}
                            className="w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors border-b border-primary/5 last:border-0 flex items-start gap-3"
                        >
                            <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                            <span className="text-sm text-foreground">{suggestion.description}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Coordinates Display */}
            {coordinates && (
                <div className="mt-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-green-600 font-medium">
                            📍 Coordinates: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

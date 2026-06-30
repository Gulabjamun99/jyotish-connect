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
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [coordinates, setCoordinates] = useState<{ lat: number, lng: number } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceTimer = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        // If the current value matches what we just selected, don't search
        if (value === selectedLocation || value.length < 3) {
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
    }, [value, selectedLocation]);

    const handleSelect = (suggestion: any) => {
        // Mark this value as the "selected" one so useEffect ignores it
        setSelectedLocation(suggestion.description);

        onChange(suggestion.description, suggestion.lat, suggestion.lng);
        setCoordinates({ lat: suggestion.lat, lng: suggestion.lng });
        setShowSuggestions(false);
        setSuggestions([]);
    };

    return (
        <div ref={containerRef} className="relative">
            <div className="relative">
                <Input
                    ref={inputRef}
                    className="h-14 pl-12 pr-6 bg-white/5 border-white/10 rounded-xl focus:border-orange-500 transition-all font-bold text-lg placeholder:text-white/20 text-white shadow-inner"
                    placeholder="Search city or location..."
                    value={value}
                    onChange={(e) => {
                        setSelectedLocation(null);
                        onChange(e.target.value);
                    }}
                    required={required}
                    autoComplete="off"
                />
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                {loading && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500 animate-spin" />
                )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-[#0a0a1a] backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto no-scrollbar">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleSelect(suggestion)}
                            className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 flex items-start gap-3 group"
                        >
                            <MapPin className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                            <span className="text-sm text-white/80 group-hover:text-white transition-colors">{suggestion.description}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Coordinates Display */}
            {coordinates && (
                <div className="mt-2 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <div className="flex items-center gap-2 text-[10px]">
                        <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                        <span className="text-orange-500 font-black uppercase tracking-widest">
                            📍 Coordinates Found: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_COLLEGES = [
  { name: "IIT Bombay", slug: "iit-bombay", city: "Mumbai" },
  { name: "IIT Delhi", slug: "iit-delhi", city: "New Delhi" },
  { name: "IIT Madras", slug: "iit-madras", city: "Chennai" },
  { name: "IIT Kanpur", slug: "iit-kanpur", city: "Kanpur" },
  { name: "IIT Kharagpur", slug: "iit-kharagpur", city: "Kharagpur" },
  { name: "BITS Pilani", slug: "bits-pilani", city: "Pilani" },
  { name: "NIT Trichy", slug: "nit-trichy", city: "Tiruchirappalli" },
  { name: "NIT Warangal", slug: "nit-warangal", city: "Warangal" },
  { name: "NIT Surathkal", slug: "nit-surathkal", city: "Mangalore" },
  { name: "DTU Delhi", slug: "dtu-delhi", city: "New Delhi" },
  { name: "NSUT Delhi", slug: "nsut-delhi", city: "New Delhi" },
  { name: "VIT Vellore", slug: "vit-vellore", city: "Vellore" },
  { name: "SRM Chennai", slug: "srm-chennai", city: "Chennai" },
  { name: "Manipal Institute of Technology", slug: "mit-manipal", city: "Manipal" },
  { name: "IIIT Hyderabad", slug: "iiit-hyderabad", city: "Hyderabad" },
  { name: "College of Engineering Pune", slug: "coep-pune", city: "Pune" },
];

interface SearchBarProps {
  compact?: boolean;
  large?: boolean;
}

export default function SearchBar({ compact = false, large = false }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<typeof MOCK_COLLEGES>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = useCallback((value: string) => {
    if (value.trim().length === 0) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    const filtered = MOCK_COLLEGES.filter(
      (c) =>
        c.name.toLowerCase().includes(value.toLowerCase()) ||
        c.city.toLowerCase().includes(value.toLowerCase())
    );
    setResults(filtered);
    setIsOpen(filtered.length > 0);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(value), 200);
  };

  const handleSelect = (slug: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/college/${slug}`);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={`relative flex items-center rounded-xl border border-white/10 bg-white/5 transition-colors focus-within:border-indigo-500/50 focus-within:bg-white/[0.07] ${
          large ? "h-14 px-5" : compact ? "h-9 px-3" : "h-10 px-4"
        }`}
      >
        <Search className={`text-zinc-500 flex-shrink-0 ${large ? "h-5 w-5" : "h-4 w-4"}`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => query.trim() && results.length > 0 && setIsOpen(true)}
          placeholder="Search any college..."
          className={`w-full bg-transparent outline-none placeholder:text-zinc-600 text-white ${
            large ? "ml-3 text-base" : "ml-2 text-sm"
          }`}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border border-white/10 bg-[#12121a] shadow-2xl shadow-black/50 overflow-hidden"
          >
            <div className="max-h-72 overflow-y-auto py-2">
              {results.map((college) => (
                <button
                  key={college.slug}
                  onClick={() => handleSelect(college.slug)}
                  className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-white/5 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{college.name}</p>
                    <p className="text-xs text-zinc-500">{college.city}</p>
                  </div>
                  <Search className="h-3 w-3 text-zinc-600" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

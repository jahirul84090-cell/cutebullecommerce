"use client";
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useDebounce } from "@/lib/useDebounce";

function AutocompleteSearch({
  className,
  placeholder,
  isMobile = false,
  onClose,
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.trim().length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/admin/product?search=${encodeURIComponent(
            debouncedQuery
          )}&limit=10`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setSuggestions(data.products || []);
        setIsOpen(data.products && data.products.length > 0);
      } catch (err) {
        setError(err.message);
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    if (e.target.value.trim().length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = () => {
    setQuery("");
    setIsOpen(false);
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <div className={`relative ${className}`} ref={inputRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm"
          aria-label="Search products"
        />
        {isLoading && query && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-purple-500" />
        )}
        {!isLoading && query && isMobile && (
          <Button
            variant="ghost"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1 text-gray-500 hover:text-purple-600 transition-colors duration-200"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
              if (onClose) onClose();
            }}
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          {isLoading && !suggestions.length && (
            <div className="flex items-center justify-center p-4 text-sm text-gray-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching
              suggestions...
            </div>
          )}
          {error && (
            <div className="p-4 text-sm text-center text-red-500">
              <span className="font-medium">Error:</span> {error}
            </div>
          )}
          {!isLoading && suggestions.length === 0 && query.length >= 2 && (
            <div className="p-4 text-sm text-center text-gray-500">
              No products found for "{query}".
            </div>
          )}
          {suggestions.length > 0 && (
            <ul className="max-h-64 overflow-y-auto">
              {suggestions.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/${product.slug}`}
                    className="flex items-center p-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 group"
                    onClick={handleSuggestionClick}
                  >
                    <div className="relative w-12 h-12 flex-shrink-0 mr-3 rounded-md overflow-hidden border border-gray-100">
                      <Image
                        src={product.mainImage}
                        alt={product.name}
                        layout="fill"
                        objectFit="cover"
                        className="group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-gray-800 group-hover:text-purple-600">
                          {product.name}
                        </span>
                        <span className="text-gray-700 text-sm font-semibold ml-2">
                          ${product.price?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        <span>{product.category?.name || "Uncategorized"}</span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default AutocompleteSearch;

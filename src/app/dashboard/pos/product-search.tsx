"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { searchProducts, type ProductResult } from "./pos-actions";

// --- Types ---

interface ProductSearchProps {
  onAddToCart: (product: ProductResult) => void;
}

// --- Component ---

export default function ProductSearch({ onAddToCart }: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Debounced search
  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length === 0) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const data = await searchProducts(q);
    setResults(data);
    setIsOpen(true);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(product: ProductResult) {
    onAddToCart(product);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return (
    <div className="product-search" ref={wrapperRef}>
      <div className="search-input-wrapper">
        <svg
          className="search-icon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
            fill="currentColor"
          />
        </svg>
        <input
          id="product-search-input"
          type="text"
          className="search-input"
          placeholder="Cari produk (nama atau kode SKU)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          autoComplete="off"
        />
        {isLoading && <span className="search-spinner" />}
      </div>

      {isOpen && results.length > 0 && (
        <div className="search-dropdown">
          {results.map((product) => (
            <button
              key={product.id}
              className="search-result-item"
              onClick={() => handleSelect(product)}
              type="button"
            >
              <div className="result-info">
                <span className="result-name">{product.name}</span>
                <span className="result-meta">
                  SKU: {product.sku}
                  {product.category && ` • ${product.category}`}
                </span>
              </div>
              <div className="result-right">
                <span className="result-price">
                  {formatCurrency(product.price)}
                </span>
                <span className="result-stock">Stok: {product.stock}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.trim().length > 0 && results.length === 0 && !isLoading && (
        <div className="search-dropdown">
          <div className="search-empty">Produk tidak ditemukan</div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchCatalogProducts, type ProductResult } from "./pos-actions";

interface ProductCatalogProps {
  onAddToCart: (product: ProductResult) => void;
}

export default function ProductCatalog({ onAddToCart }: ProductCatalogProps) {
  const [products, setProducts] = useState<ProductResult[]>([]);
  const [categories, setCategories] = useState<string[]>(["Semua"]);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const loadCatalog = useCallback(async (c: string, p: number) => {
    setIsLoading(true);
    const { data, meta } = await fetchCatalogProducts(p, c);
    setProducts(data);
    if (meta.categories && meta.categories.length > 0) {
      setCategories(meta.categories);
    }
    setTotalPages(meta.pages || 1);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadCatalog(activeCategory, page);
  }, [activeCategory, page, loadCatalog]);

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    setPage(1);
  };

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return (
    <div className="product-catalog">
      {/* Category Filter */}
      <div className="catalog-categories">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-pill ${activeCategory === cat ? "active" : ""}`}
            onClick={() => handleCategoryClick(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="catalog-grid">
        {isLoading ? (
          <div className="catalog-loading">Memuat produk...</div>
        ) : products.length === 0 ? (
          <div className="catalog-empty">Tidak ada produk ditemukan</div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="catalog-card">
              <div className="catalog-card-image">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} />
                ) : (
                  <div className="catalog-no-image">No Image</div>
                )}
              </div>
              <div className="catalog-card-info">
                <div className="catalog-card-title">{product.name}</div>
                <div className="catalog-card-bottom">
                  <div className="catalog-card-price">{formatCurrency(product.price)}</div>
                  <button 
                    className="catalog-card-add" 
                    onClick={() => onAddToCart(product)}
                    disabled={product.stock <= 0}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="catalog-pagination">
          <button 
            disabled={page <= 1 || isLoading} 
            onClick={() => setPage(page - 1)}
          >
            &lt;
          </button>
          <span>{page} / {totalPages}</span>
          <button 
            disabled={page >= totalPages || isLoading} 
            onClick={() => setPage(page + 1)}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
}

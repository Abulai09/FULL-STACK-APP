import { useEffect, useState, useCallback } from "react";
import { getProducts } from "../../api/product";
import ProductCard from "../../components/ProductCard";
import "./Home.css";

const CATEGORIES = ["All", "Electronics", "Clothing", "Books", "Food", "Other"];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchProducts = useCallback(
    async (resetPage = false) => {
      setLoading(true);
      try {
        const currentPage = resetPage ? 1 : page;
        const params = { page: currentPage, limit: 12 };
        if (search) params.search = search;
        if (category && category !== "All") params.category = category;

        const data = await getProducts(params);
        setProducts(data.data);
        setTotal(data.total);
        setLastPage(data.lastPage);
        if (resetPage) setPage(1);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    },
    [page, search, category],
  );

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, page]);
  useEffect(() => {
    fetchProducts(true);
  }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(true);
  };

  return (
    <div className="home">
      {/* ✅ Поиск по центру */}
      <div className="search-center">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      {/* Категории + счётчик в одну строку */}
      <div className="cats-row">
        <div className="categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`cat-btn ${category === cat || (cat === "All" && !category) ? "active" : ""}`}
              onClick={() => setCategory(cat === "All" ? "" : cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <span className="results-info">{total} products found</span>
      </div>

      {loading ? (
        <div className="loading">Loading…</div>
      ) : products.length === 0 ? (
        <div className="empty">No products found</div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {lastPage > 1 && (
        <div className="pagination">
          <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
            ← Prev
          </button>
          {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={page === p ? "active" : ""}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === lastPage}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

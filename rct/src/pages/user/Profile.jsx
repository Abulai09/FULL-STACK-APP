import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getMyProducts, deleteProduct } from "../../api/product";
import ProductCard from "../../components/ProductCard";
import "./Profile.css";

const TABS = ["My products", "Settings"];

export default function Profile() {
  const navigate = useNavigate();
  const payload = useSelector((state) => state.auth.payload);

  const [tab, setTab] = useState("My products");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const initials = payload?.username?.slice(0, 2).toUpperCase() || "?";

  const fetchMyProducts = async () => {
    setLoading(true);
    try {
      const data = await getMyProducts();
      setProducts(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "My products") fetchMyProducts();
  }, [tab]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      fetchMyProducts();
    } catch (e) {
      alert(e?.response?.data?.message || "Error");
    }
  };

  return (
    <div className="profile-page">
      {/* Шапка профиля */}
      <div className="profile-header">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-info">
          <h1 className="profile-name">{payload?.username}</h1>
          <p className="profile-email">{payload?.email || "No email"}</p>
        </div>
      </div>

      {/* Вкладки */}
      <div className="profile-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`profile-tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Мои товары */}
      {tab === "My products" && (
        <div className="profile-content">
          <button
            className="add-product-btn"
            onClick={() => navigate("/create")}
          >
            + Add new product
          </button>

          {loading ? (
            <div className="profile-loading">Loading…</div>
          ) : products.length === 0 ? (
            <div className="profile-empty">
              <p>You haven't listed any products yet</p>
            </div>
          ) : (
            <div className="my-products-grid">
              {products.map((product) => (
                <div key={product.id} className="my-product-wrap">
                  <ProductCard product={product} />
                  <div className="my-product-actions">
                    <button
                      className="action-edit"
                      onClick={() => navigate(`/product/${product.id}/edit`)}
                    >
                      Edit
                    </button>
                    <button
                      className="action-delete"
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings */}
      {tab === "Settings" && (
        <div className="profile-content">
          <div className="settings-section">
            <p className="settings-label">Username</p>
            <p className="settings-value">{payload?.username}</p>
          </div>
          <div className="settings-section">
            <p className="settings-label">Role</p>
            <p className="settings-value">{payload?.role}</p>
          </div>
          <p className="settings-note">Profile editing coming soon</p>
        </div>
      )}
    </div>
  );
}

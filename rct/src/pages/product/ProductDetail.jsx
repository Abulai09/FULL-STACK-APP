import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProduct, deleteProduct } from "../../api/product";
import { addToCart } from "../../api/cart";
import "./ProductDetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isAuth = useSelector((state) => state.auth.isAuth);
  const payload = useSelector((state) => state.auth.payload);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Проверяем права
  const isOwner = payload?.id === product?.userId;
  const isAdmin = payload?.role === "admin";
  const canEdit = isOwner || isAdmin;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProduct(id);
        setProduct(data);
      } catch (e) {
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuth) {
      navigate("/login");
      return;
    }
    setCartLoading(true);
    try {
      await dispatch(addToCart(product.id, quantity));
      setMessage("Added to cart!");
      setTimeout(() => setMessage(null), 2000);
    } catch (e) {
      setMessage(e?.response?.data?.message || "Error");
    } finally {
      setCartLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(product.id);
      navigate("/");
    } catch (e) {
      setMessage(e?.response?.data?.message || "Error");
    }
  };

  // ─── States ───────────────────────────────────────
  if (loading) {
    return (
      <div className="pd-center">
        <div className="pd-loading">Loading…</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pd-center">
        <div className="pd-error">
          <h2>Product not found</h2>
          <button onClick={() => navigate("/")}>← Back to home</button>
        </div>
      </div>
    );
  }

  const outOfStock = product.stock === 0;

  return (
    <div className="pd-page">
      <button className="pd-back" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="pd-content">
        {/* Фото */}
        <div className="pd-image-wrap">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="pd-image"
            />
          ) : (
            <div className="pd-image-placeholder">No image</div>
          )}
        </div>

        {/* Информация */}
        <div className="pd-info">
          {product.category && (
            <span className="pd-category">{product.category}</span>
          )}

          <h1 className="pd-title">{product.title}</h1>

          <p className="pd-price">${Number(product.price).toFixed(2)}</p>

          <p className="pd-description">{product.description}</p>

          <div className="pd-stock">
            {outOfStock ? (
              <span className="stock-out">Out of stock</span>
            ) : (
              <span className="stock-in">{product.stock} in stock</span>
            )}
          </div>

          {/* Автор */}
          <p className="pd-author">
            Seller: <strong>{product.user?.username || "Unknown"}</strong>
          </p>

          {/* Количество + корзина */}
          {!outOfStock && (
            <div className="pd-cart-row">
              <div className="quantity-control">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock, q + 1))
                  }
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>

              <button
                className="btn-add-cart"
                onClick={handleAddToCart}
                disabled={cartLoading || outOfStock}
              >
                {cartLoading ? "Adding…" : "Add to cart"}
              </button>
            </div>
          )}

          {/* Сообщение */}
          {message && (
            <div
              className={`pd-message ${message.includes("Error") || message.includes("Cannot") ? "error" : "success"}`}
            >
              {message}
            </div>
          )}

          {/* Кнопки владельца */}
          {canEdit && (
            <div className="pd-owner-actions">
              <button
                className="btn-edit"
                onClick={() => navigate(`/product/${id}/edit`)}
              >
                Edit
              </button>
              <button className="btn-delete" onClick={handleDelete}>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

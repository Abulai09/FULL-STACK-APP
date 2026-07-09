import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../api/cart";
import { fetchCart } from "../api/cart";
import "./ProductCard.css";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuth = useSelector((state) => state.auth.isAuth);

  const handleAddToCart = async (e) => {
    e.stopPropagation(); // не переходим на страницу товара
    if (!isAuth) {
      navigate("/login");
      return;
    }
    try {
      await dispatch(addToCart(product.id, 1));
    } catch (e) {
      alert(e?.response?.data?.message || "Error");
    }
  };

  return (
    <div
      className="product-card"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="product-img-wrap">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="product-img"
          />
        ) : (
          <div className="product-img-placeholder">No image</div>
        )}
      </div>

      <div className="product-info">
        {product.category && (
          <span className="product-category">{product.category}</span>
        )}
        <h3 className="product-title">{product.title}</h3>
        <p className="product-price">${Number(product.price).toFixed(2)}</p>
        <p className="product-stock">
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </p>
      </div>

      <button
        className="btn-add-cart"
        onClick={handleAddToCart}
        disabled={product.stock === 0}
      >
        {product.stock === 0 ? "Out of stock" : "Add to cart"}
      </button>
    </div>
  );
}

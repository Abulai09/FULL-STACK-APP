import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../../api/cart";
import { createOrder } from "../../api/orders";
import "./Cart.css";

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items, total, count } = useSelector((state) => state.cart);
  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleQuantityChange = async (productId, quantity) => {
    try {
      await dispatch(updateCartItem(productId, quantity));
    } catch (e) {
      setMessage(e?.response?.data?.message || "Error");
    }
  };

  const handleRemove = async (productId) => {
    try {
      await dispatch(removeFromCart(productId));
    } catch (e) {
      setMessage(e?.response?.data?.message || "Error");
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Clear cart?")) return;
    try {
      await dispatch(clearCart());
    } catch (e) {
      console.log(e);
    }
  };

  const handleCheckout = async () => {
    if (!address.trim()) {
      setMessage("Please enter delivery address");
      return;
    }
    setOrderLoading(true);
    try {
      const order = await createOrder(address);
      dispatch(fetchCart()); // обновляем корзину (она очистится)
      navigate(`/orders`);
    } catch (e) {
      setMessage(e?.response?.data?.message || "Error");
    } finally {
      setOrderLoading(false);
    }
  };

  // Пустая корзина
  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add some products to get started</p>
        <button onClick={() => navigate("/")}>Browse products</button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1 className="cart-title">Cart</h1>
        <span className="cart-count">{count} items</span>
        <button className="cart-clear" onClick={handleClear}>
          Clear all
        </button>
      </div>

      <div className="cart-layout">
        {/* Список товаров */}
        <div className="cart-items">
          {items.map((item) => (
            <div className="cart-item" key={item.productId}>
              {/* Фото */}
              <div
                className="cart-item-img"
                onClick={() => navigate(`/product/${item.productId}`)}
              >
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} />
                ) : (
                  <div className="cart-item-img-placeholder">No img</div>
                )}
              </div>

              {/* Инфо */}
              <div className="cart-item-info">
                <p
                  className="cart-item-title"
                  onClick={() => navigate(`/product/${item.productId}`)}
                >
                  {item.title}
                </p>
                <p className="cart-item-price">
                  ${Number(item.price).toFixed(2)}
                </p>
              </div>

              {/* Количество */}
              <div className="quantity-control">
                <button
                  onClick={() =>
                    handleQuantityChange(item.productId, item.quantity - 1)
                  }
                  disabled={item.quantity <= 1}
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() =>
                    handleQuantityChange(item.productId, item.quantity + 1)
                  }
                >
                  +
                </button>
              </div>

              {/* Сумма */}
              <p className="cart-item-subtotal">
                ${(Number(item.price) * item.quantity).toFixed(2)}
              </p>

              {/* Удалить */}
              <button
                className="cart-item-remove"
                onClick={() => handleRemove(item.productId)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Итого и оформление */}
        <div className="cart-summary">
          <h2 className="summary-title">Order summary</h2>

          <div className="summary-row">
            <span>Items ({count})</span>
            <span>${Number(total).toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Delivery</span>
            <span className="free">Free</span>
          </div>

          <div className="summary-total">
            <span>Total</span>
            <span>${Number(total).toFixed(2)}</span>
          </div>

          {/* Адрес */}
          <div className="summary-address">
            <label>Delivery address</label>
            <textarea
              placeholder="Enter your delivery address…"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
            />
          </div>

          {/* Сообщение */}
          {message && (
            <div
              className={`summary-message ${message.includes("Error") || message.includes("Please") ? "error" : "success"}`}
            >
              {message}
            </div>
          )}

          <button
            className="btn-checkout"
            onClick={handleCheckout}
            disabled={orderLoading || items.length === 0}
          >
            {orderLoading ? "Placing order…" : "Place order"}
          </button>
        </div>
      </div>
    </div>
  );
}

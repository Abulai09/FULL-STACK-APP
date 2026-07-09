import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyOrders, cancelOrder } from "../../api/orders";
import "./Orders.css";

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipping: "Shipping",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_CLASS = {
  pending: "status-pending",
  confirmed: "status-confirmed",
  shipping: "status-shipping",
  delivered: "status-delivered",
  cancelled: "status-cancelled",
};

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null); // какой заказ раскрыт

  const fetchOrders = async () => {
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      await cancelOrder(id);
      fetchOrders(); // обновляем список
    } catch (e) {
      alert(e?.response?.data?.message || "Error");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const canCancel = (status) =>
    status !== "delivered" && status !== "cancelled";

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ─── States ───────────────────────────────
  if (loading) {
    return (
      <div className="orders-center">
        <p className="orders-loading">Loading…</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-empty">
        <div className="orders-empty-icon">📦</div>
        <h2>No orders yet</h2>
        <p>Your orders will appear here</p>
        <button onClick={() => navigate("/")}>Start shopping</button>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1 className="orders-title">My Orders</h1>
        <span className="orders-meta">{orders.length} total</span>
      </div>

      <div className="orders-list">
        {orders.map((order) => (
          <div className="order-card" key={order.id}>
            {/* Шапка заказа */}
            <div
              className="order-card-header"
              onClick={() =>
                setExpanded(expanded === order.id ? null : order.id)
              }
            >
              <div className="order-card-left">
                <span className="order-id">Order #{order.id}</span>
                <span className="order-date">
                  {formatDate(order.createdAt)}
                </span>
              </div>

              <div className="order-card-right">
                <span className={`status-badge ${STATUS_CLASS[order.status]}`}>
                  {STATUS_LABELS[order.status]}
                </span>
                <span className="order-total">
                  ${Number(order.totalPrice).toFixed(2)}
                </span>
                <span className="order-chevron">
                  {expanded === order.id ? "▲" : "▼"}
                </span>
              </div>
            </div>

            {/* Детали заказа — раскрываются по клику */}
            {expanded === order.id && (
              <div className="order-card-body">
                {/* Адрес */}
                {order.address && (
                  <p className="order-address">📍 {order.address}</p>
                )}

                {/* Товары */}
                <div className="order-items">
                  {order.items?.map((item) => (
                    <div className="order-item" key={item.id}>
                      <div
                        className="order-item-img"
                        onClick={() => navigate(`/product/${item.productId}`)}
                      >
                        {item.product?.imageUrl ? (
                          <img src={item.product.imageUrl} alt={item.title} />
                        ) : (
                          <div className="order-item-img-placeholder">—</div>
                        )}
                      </div>

                      <div className="order-item-info">
                        <p
                          className="order-item-title"
                          onClick={() => navigate(`/product/${item.productId}`)}
                        >
                          {item.title}
                        </p>
                        <p className="order-item-meta">
                          {item.quantity} × ${Number(item.price).toFixed(2)}
                        </p>
                      </div>

                      <p className="order-item-subtotal">
                        ${(item.quantity * Number(item.price)).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Итого + кнопка отмены */}
                <div className="order-card-footer">
                  <div className="order-footer-total">
                    <span>Total</span>
                    <span>${Number(order.totalPrice).toFixed(2)}</span>
                  </div>

                  {canCancel(order.status) && (
                    <button
                      className="btn-cancel"
                      onClick={() => handleCancel(order.id)}
                    >
                      Cancel order
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

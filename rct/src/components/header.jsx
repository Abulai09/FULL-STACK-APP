import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logOut } from "../api/auth";
import { fetchCart } from "../api/cart";
import "./Header.css";

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuth = useSelector((state) => state.auth.isAuth);
  const payload = useSelector((state) => state.auth.payload);
  const cartCount = useSelector((state) => state.cart.count);

  const isAdmin = payload?.role === "admin";
  const initials = payload?.username?.slice(0, 2).toUpperCase() || "?";

  useEffect(() => {
    if (isAuth) dispatch(fetchCart());
  }, [isAuth]);

  return (
    <header className="header">
      {/* Левая часть — логотип */}
      <Link to="/" className="logo">
        StyleStore
      </Link>

      {/* Центр — навигация */}
      <nav className="nav">
        {isAdmin && (
          <Link to="/admin" className="nav-admin">
            Admin
          </Link>
        )}
        <Link to="/">Home</Link>
        <Link to="/orders">Orders</Link>
      </nav>

      {/* Правая часть */}
      {isAuth ? (
        <div className="hright">
          {/* ✅ Аватар — клик ведёт на профиль */}
          <Link to="/profile" className="avatar-link" title={payload?.username}>
            {initials}
          </Link>
          <span className="username">{payload?.username}</span>

          <Link to="/cart" className="cart-btn" aria-label="Cart">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </Link>

          <button className="btn-outline" onClick={() => dispatch(logOut())}>
            Log out
          </button>
        </div>
      ) : (
        <div className="hright">
          <Link to="/login" className="btn-outline">
            Login
          </Link>
          <Link to="/registration" className="btn-primary">
            Register
          </Link>
        </div>
      )}
    </header>
  );
}

import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const { payload, isAuth } = useSelector((state) => state.auth);

  // ✅ Не авторизован — на логин
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Роль не совпадает — на главную
  if (role && payload?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}

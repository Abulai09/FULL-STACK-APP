import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/header";
import Login from "./pages/auth/login";
import Registration from "./pages/auth/registration";
import Home from "./pages/product/Home";
import ProductDetail from "./pages/product/ProductDetail";
import CreateProduct from "./pages/product/CreateProduct";
import EditProduct from "./pages/product/EditProduct";
import Cart from "./pages/user/Cart";
import Orders from "./pages/user/Orders";
import Profile from "./pages/user/Profile";
import Admin from "./pages/admin/admin";

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/product/:id" element={<ProductDetail />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreateProduct />
            </ProtectedRoute>
          }
        />

        {/* Только авторизованные */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/product/:id/edit"
          element={
            <ProtectedRoute>
              <EditProduct />
            </ProtectedRoute>
          }
        />

        {/* Только admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

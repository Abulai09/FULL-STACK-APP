import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../../api/product";
import ProductForm from "../../components/ProductForm";
import "./ProductFormPage.css";

export default function CreateProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const product = await createProduct(formData);
      navigate(`/product/${product.id}`);
    } catch (e) {
      setError(e?.response?.data?.message || "Error creating product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1 className="form-page-title">Create product</h1>
      </div>

      {error && <div className="form-page-error">{error}</div>}

      <ProductForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}

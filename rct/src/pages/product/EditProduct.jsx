import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProduct, updateProduct } from "../../api/product";
import ProductForm from "../../components/ProductForm";
import "./ProductFormPage.css";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загружаем существующий продукт
  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getProduct(id);
        setProduct(data);
      } catch (e) {
        setError("Product not found");
      } finally {
        setFetchLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      await updateProduct(id, formData);
      navigate(`/product/${id}`);
    } catch (e) {
      setError(e?.response?.data?.message || "Error updating product");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return <div className="form-page-loading">Loading…</div>;
  }

  if (error && !product) {
    return <div className="form-page-error">{error}</div>;
  }

  return (
    <div className="form-page">
      <div className="form-page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1 className="form-page-title">Edit product</h1>
      </div>

      {error && <div className="form-page-error">{error}</div>}

      {/* ✅ Передаём начальные данные в форму */}
      <ProductForm
        initialData={product}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}

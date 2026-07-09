import { useState } from "react";
import "./ProductForm.css";

const CATEGORIES = ["Electronics", "Clothing", "Books", "Food", "Other"];

export default function ProductForm({ initialData = {}, onSubmit, loading }) {
  const [title, setTitle] = useState(initialData.title || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [price, setPrice] = useState(initialData.price || "");
  const [stock, setStock] = useState(initialData.stock || "");
  const [category, setCategory] = useState(initialData.category || "");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(initialData.imageUrl || null);
  const [errors, setErrors] = useState({});

  // ✅ Превью фото до отправки
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Валидация типа
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "Only images allowed" }));
      return;
    }

    // Валидация размера (макс 5mb)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "Max file size is 5MB" }));
      return;
    }

    setImage(file);
    setErrors((prev) => ({ ...prev, image: null }));

    // Создаём превью
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  // ✅ Валидация
  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!price || Number(price) < 0)
      newErrors.price = "Valid price is required";
    if (!stock || Number(stock) < 0)
      newErrors.stock = "Valid stock is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // ✅ FormData для отправки файла
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("stock", stock);
    if (category) formData.append("category", category);
    if (image) formData.append("image", image);

    onSubmit(formData);
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      {/* Фото */}
      <div className="form-group">
        <label className="form-label">Product image</label>
        <div
          className={`image-upload ${preview ? "has-image" : ""}`}
          onClick={() => document.getElementById("image-input").click()}
        >
          {preview ? (
            <img src={preview} alt="preview" className="image-preview" />
          ) : (
            <div className="image-upload-placeholder">
              <span className="upload-icon">+</span>
              <span>Click to upload image</span>
              <span className="upload-hint">PNG, JPG up to 5MB</span>
            </div>
          )}
        </div>
        <input
          id="image-input"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: "none" }}
        />
        {errors.image && <p className="form-error">{errors.image}</p>}
        {preview && (
          <button
            type="button"
            className="remove-image"
            onClick={(e) => {
              e.stopPropagation();
              setPreview(null);
              setImage(null);
            }}
          >
            Remove image
          </button>
        )}
      </div>

      {/* Title */}
      <div className="form-group">
        <label className="form-label">Title *</label>
        <input
          type="text"
          className={`form-input ${errors.title ? "input-error" : ""}`}
          placeholder="Product name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {errors.title && <p className="form-error">{errors.title}</p>}
      </div>

      {/* Description */}
      <div className="form-group">
        <label className="form-label">Description *</label>
        <textarea
          className={`form-input form-textarea ${errors.description ? "input-error" : ""}`}
          placeholder="Describe your product…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
        {errors.description && (
          <p className="form-error">{errors.description}</p>
        )}
      </div>

      {/* Price + Stock */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Price *</label>
          <div className="input-with-prefix">
            <span className="input-prefix">$</span>
            <input
              type="number"
              className={`form-input ${errors.price ? "input-error" : ""}`}
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
          {errors.price && <p className="form-error">{errors.price}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Stock *</label>
          <input
            type="number"
            className={`form-input ${errors.stock ? "input-error" : ""}`}
            placeholder="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            min="0"
          />
          {errors.stock && <p className="form-error">{errors.stock}</p>}
        </div>
      </div>

      {/* Category */}
      <div className="form-group">
        <label className="form-label">Category</label>
        <select
          className="form-input form-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select category…</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Submit */}
      <button type="submit" className="btn-submit" disabled={loading}>
        {loading ? "Saving…" : "Save product"}
      </button>
    </form>
  );
}

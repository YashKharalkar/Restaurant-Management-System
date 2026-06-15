import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import api from '../../api/axios';

const CATEGORIES = ['Starters', 'Mains', 'Desserts', 'Drinks', 'Specials'];

const AddMenuItem = () => {
  const [form, setForm] = useState({ name: '', category: '', description: '', price: '' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    // Show a local preview of the selected image
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.category || !form.price) {
      return setError('Name, category, and price are required');
    }

    setLoading(true);
    try {
      // Use FormData because we're sending an image file
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('category', form.category);
      formData.append('description', form.description);
      formData.append('price', form.price);
      if (image) formData.append('image', image);

      await api.post('/admin/menu', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h2>Add New Menu Item</h2>
        <Link to="/admin/dashboard" className="btn btn-outline" style={{ borderColor: '#fff', color: '#fff' }}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </Link>
      </div>

      <div className="admin-body" style={{ maxWidth: '600px' }}>
        <div className="form-container" style={{ margin: 0 }}>
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Dish Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Grilled Salmon"
                required
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short description of the dish..."
              />
            </div>

            <div className="form-group">
              <label>Price (₹) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="e.g. 350"
                required
              />
            </div>

            <div className="form-group">
              <label>Food Image (optional)</label>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {preview && (
                <img src={preview} alt="Preview" style={{ marginTop: '10px', width: '150px', height: '110px', objectFit: 'cover', borderRadius: '8px' }} />
              )}
            </div>

            <button type="submit" className="btn btn-primary form-btn" disabled={loading}>
              {loading ? 'Adding...' : 'Add Menu Item'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMenuItem;

import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import api from '../../api/axios';

const CATEGORIES = ['Starters', 'Mains', 'Desserts', 'Drinks', 'Specials'];

const EditMenuItem = () => {
  const { id } = useParams();
  const [form, setForm] = useState({ name: '', category: '', description: '', price: '' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/menu/${id}`)
      .then((res) => {
        const item = res.data;
        setForm({
          name: item.name,
          category: item.category,
          description: item.description || '',
          price: item.price,
        });
        if (item.image_url) {
          setCurrentImage(`http://localhost:5000${item.image_url}`);
        }
      })
      .catch(() => setError('Failed to load item'))
      .finally(() => setFetching(false));
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('category', form.category);
      formData.append('description', form.description);
      formData.append('price', form.price);
      if (image) formData.append('image', image);

      await api.put(`/admin/menu/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <p className="spinner">Loading item...</p>;

  return (
    <div>
      <div className="admin-header">
        <h2>Edit Menu Item</h2>
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
                required
              />
            </div>

            <div className="form-group">
              <label>Food Image</label>
              {currentImage && !preview && (
                <div style={{ marginBottom: '10px' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '6px' }}>Current image:</p>
                  <img src={currentImage} alt="Current" style={{ width: '150px', height: '110px', objectFit: 'cover', borderRadius: '8px' }} />
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {preview && (
                <div style={{ marginTop: '10px' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '6px' }}>New image preview:</p>
                  <img src={preview} alt="Preview" style={{ width: '150px', height: '110px', objectFit: 'cover', borderRadius: '8px' }} />
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary form-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMenuItem;

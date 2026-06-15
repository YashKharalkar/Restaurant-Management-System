import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSignOutAlt, faUtensils } from '@fortawesome/free-solid-svg-icons';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteMsg, setDeleteMsg] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchItems = async () => {
    try {
      const res = await api.get('/admin/menu');
      setItems(res.data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/admin/menu/${id}`);
      setDeleteMsg(`"${name}" deleted successfully.`);
      fetchItems(); // Refresh list
      setTimeout(() => setDeleteMsg(''), 3000);
    } catch {
      alert('Failed to delete item.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div>
      {/* Admin Header */}
      <div className="admin-header">
        <h2>
          <FontAwesomeIcon icon={faUtensils} style={{ marginRight: '10px' }} />
          Admin Dashboard — The Grand Table
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '0.9rem' }}>Welcome, {user?.name}</span>
          <button className="btn btn-outline" style={{ borderColor: '#fff', color: '#fff' }} onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} /> Logout
          </button>
        </div>
      </div>

      <div className="admin-body">
        {deleteMsg && <div className="alert alert-success">{deleteMsg}</div>}

        <div className="admin-top-bar">
          <h3 style={{ color: 'var(--primary)' }}>Menu Items ({items.length})</h3>
          <Link to="/admin/add" className="btn btn-primary">
            <FontAwesomeIcon icon={faPlus} /> &nbsp;Add New Item
          </Link>
        </div>

        {loading ? (
          <p className="spinner">Loading...</p>
        ) : items.length === 0 ? (
          <p className="no-results"><p>No menu items found. Add your first item!</p></p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td><strong>{item.name}</strong></td>
                  <td>{item.category}</td>
                  <td>₹{Number(item.price).toFixed(2)}</td>
                  <td>
                    <div className="action-btns">
                      <Link to={`/admin/edit/${item.id}`} className="btn btn-outline">
                        <FontAwesomeIcon icon={faEdit} /> Edit
                      </Link>
                      <button className="btn btn-danger" onClick={() => handleDelete(item.id, item.name)}>
                        <FontAwesomeIcon icon={faTrash} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

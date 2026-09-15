import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faSignOutAlt,
  faUtensils,
  faReceipt,
  faCalendarAlt,
  faEnvelope,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'menu';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [contacts, setContacts] = useState([]);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Sync tab with URL search parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['menu', 'orders', 'reservations', 'contacts'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const showMsg = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [menuRes, ordRes, resRes, contRes] = await Promise.all([
        api.get('/admin/menu'),
        api.get('/orders/admin/all'),
        api.get('/reservations/admin/all'),
        api.get('/admin/contacts'),
      ]);
      setMenuItems(menuRes.data || []);
      setOrders(ordRes.data || []);
      setReservations(resRes.data || []);
      setContacts(contRes.data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteMenu = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/admin/menu/${id}`);
      showMsg(`"${name}" deleted.`);
      fetchData();
    } catch {
      alert('Failed to delete item.');
    }
  };

  const handleUpdateOrderStatus = async (id, newStatus) => {
    try {
      await api.patch(`/orders/admin/${id}/status`, { order_status: newStatus });
      showMsg(`Order #${id} updated to ${newStatus}.`);
      fetchData();
    } catch {
      alert('Failed to update order status.');
    }
  };

  const handleUpdateResStatus = async (id, newStatus) => {
    try {
      await api.patch(`/reservations/admin/${id}/status`, { status: newStatus });
      showMsg(`Reservation #${id} marked as ${newStatus}.`);
      fetchData();
    } catch {
      alert('Failed to update reservation.');
    }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.delete(`/admin/contacts/${id}`);
      showMsg('Message deleted.');
      fetchData();
    } catch {
      alert('Failed to delete contact.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ backgroundColor: '#f5f9fb', minHeight: '90vh', padding: '30px 0' }}>
      <div className="container">
        <div className="cart-page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              className="admin-back-btn"
              onClick={() => navigate('/menu')}
              title="Back to Menu"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <div>
              <h1 style={{ fontSize: '1.8rem', color: 'var(--primary)', margin: 0, fontWeight: 700 }}>
                Admin Management
              </h1>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                Manage menu dishes, live customer orders, table reservations, and inquiries.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn ${activeTab === 'menu' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              onClick={() => handleTabChange('menu')}
            >
              <FontAwesomeIcon icon={faUtensils} /> Menu Items ({menuItems.length})
            </button>
            <button
              type="button"
              className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              onClick={() => handleTabChange('orders')}
            >
              <FontAwesomeIcon icon={faReceipt} /> Orders ({orders.length})
            </button>
            <button
              type="button"
              className={`btn ${activeTab === 'reservations' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              onClick={() => handleTabChange('reservations')}
            >
              <FontAwesomeIcon icon={faCalendarAlt} /> Reservations ({reservations.length})
            </button>
            <button
              type="button"
              className={`btn ${activeTab === 'contacts' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              onClick={() => handleTabChange('contacts')}
            >
              <FontAwesomeIcon icon={faEnvelope} /> Inquiries ({contacts.length})
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', background: '#fff' }}>
        {msg && <div className="alert alert-success">{msg}</div>}
        {loading && <p className="spinner">Loading data...</p>}

        {/* TAB 1: MENU ITEMS */}
        {activeTab === 'menu' && (
          <div>
            <div className="admin-top-bar">
              <h3 style={{ color: 'var(--primary)' }}>Menu Items ({menuItems.length})</h3>
              <Link to="/admin/add" className="btn btn-primary">
                <FontAwesomeIcon icon={faPlus} /> &nbsp;Add New Item
              </Link>
            </div>

            {menuItems.length === 0 ? (
              <div className="no-results"><p>No menu items found.</p></div>
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
                  {menuItems.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td><strong>{item.name}</strong></td>
                      <td>{item.category}</td>
                      <td>₹{Number(item.price).toFixed(2)}</td>
                      <td>
                        <div className="action-btns">
                          <Link to={`/admin/edit/${item.id}`} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.82rem' }}>
                            <FontAwesomeIcon icon={faEdit} /> Edit
                          </Link>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '4px 10px', fontSize: '0.82rem' }}
                            onClick={() => handleDeleteMenu(item.id, item.name)}
                          >
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
        )}

        {/* TAB 2: ORDERS */}
        {activeTab === 'orders' && (
          <div>
            <div className="admin-top-bar">
              <h3 style={{ color: 'var(--primary)' }}>Customer Orders ({orders.length})</h3>
            </div>

            {orders.length === 0 ? (
              <div className="no-results"><p>No customer orders placed yet.</p></div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#ID</th>
                    <th>Customer</th>
                    <th>Address & Phone</th>
                    <th>Items Ordered</th>
                    <th>Total & Mode</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td><strong>#{o.id}</strong></td>
                      <td>
                        <strong>{o.customer_name}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{o.customer_email}</div>
                      </td>
                      <td>
                        <div>{o.delivery_address}</div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Phone: {o.contact_phone}</div>
                      </td>
                      <td>
                        {o.items?.map((it, idx) => (
                          <div key={idx} style={{ fontSize: '0.85rem' }}>
                            • {it.item_name} × {it.quantity}
                            {it.special_instructions && (
                              <span style={{ color: '#d97706', fontSize: '0.78rem' }}> (Note: {it.special_instructions})</span>
                            )}
                          </div>
                        ))}
                      </td>
                      <td>
                        <strong>₹{Number(o.total_amount).toFixed(2)}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{o.payment_method?.toUpperCase()} ({o.payment_status})</div>
                      </td>
                      <td>
                        <select
                          value={o.order_status}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                          style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.85rem', fontWeight: 600 }}
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TAB 3: RESERVATIONS */}
        {activeTab === 'reservations' && (
          <div>
            <div className="admin-top-bar">
              <h3 style={{ color: 'var(--primary)' }}>Table Reservations ({reservations.length})</h3>
            </div>

            {reservations.length === 0 ? (
              <div className="no-results"><p>No table reservations found.</p></div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#ID</th>
                    <th>Date & Slot</th>
                    <th>Guest Details</th>
                    <th>Area & Guests</th>
                    <th>Special Request</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r) => (
                    <tr key={r.id}>
                      <td><strong>#{r.id}</strong></td>
                      <td>
                        <strong>{new Date(r.reservation_date).toLocaleDateString()}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{r.time_slot}</div>
                      </td>
                      <td>
                        <strong>{r.customer_name}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{r.customer_phone}</div>
                        <div style={{ fontSize: '0.78rem', color: '#888' }}>{r.customer_email}</div>
                      </td>
                      <td>
                        <strong>{r.seating_zone}</strong>
                        <div>{r.guests_count} Person(s)</div>
                      </td>
                      <td>{r.special_requests || '-'}</td>
                      <td>
                        <select
                          value={r.status}
                          onChange={(e) => handleUpdateResStatus(r.id, e.target.value)}
                          style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.85rem', fontWeight: 600 }}
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TAB 4: CONTACTS */}
        {activeTab === 'contacts' && (
          <div>
            <div className="admin-top-bar">
              <h3 style={{ color: 'var(--primary)' }}>Customer Inquiries ({contacts.length})</h3>
            </div>

            {contacts.length === 0 ? (
              <div className="no-results"><p>No inquiries received yet.</p></div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Message</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c) => (
                    <tr key={c.id}>
                      <td><strong>{c.name}</strong></td>
                      <td>{c.email}</td>
                      <td>{c.message}</td>
                      <td style={{ fontSize: '0.8rem', color: '#666' }}>
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-danger"
                          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                          onClick={() => handleDeleteContact(c.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faReceipt,
  faRedo,
  faArrowLeft,
  faUtensils,
  faClock,
  faMapMarkerAlt,
  faPhone,
} from '@fortawesome/free-solid-svg-icons';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { populateCart } = useCart();
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleReorder = (order) => {
    if (!order.items || order.items.length === 0) return;
    populateCart(order.items);
    navigate('/payment');
  };

  return (
    <section className="section" style={{ backgroundColor: '#f5f9fb', minHeight: '80vh' }}>
      <div className="container">
        <div className="cart-page-header">
          <div>
            <h1>
              <FontAwesomeIcon icon={faReceipt} /> My Orders
            </h1>
            <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>
              View your past orders and reorder your favorite meals.
            </p>
          </div>
          <Link to="/menu" className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 18px' }}>
            <FontAwesomeIcon icon={faArrowLeft} /> Browse Menu
          </Link>
        </div>

        {loading ? (
          <p className="spinner" style={{ textAlign: 'center', margin: '40px 0' }}>Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">
              <FontAwesomeIcon icon={faReceipt} />
            </div>
            <h2>No Orders Found</h2>
            <p>You have not placed any orders yet. Check out our menu!</p>
            <Link to="/menu" className="btn btn-primary" style={{ marginTop: '15px' }}>
              <FontAwesomeIcon icon={faUtensils} /> Explore Menu
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map((order) => (
              <div key={order.id} className="card" style={{ padding: '24px', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '14px' }}>
                  <div>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>Order #{order.id}</strong>
                    <span style={{ fontSize: '0.85rem', color: '#666', marginLeft: '12px' }}>
                      <FontAwesomeIcon icon={faClock} style={{ marginRight: '4px' }} />
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      backgroundColor: order.order_status === 'completed' ? '#c6f6d5' : '#ebf8ff',
                      color: order.order_status === 'completed' ? '#22543d' : '#2b6cb0',
                      textTransform: 'uppercase',
                    }}>
                      {order.order_status}
                    </span>

                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      backgroundColor: '#edf2f7',
                      color: '#4a5568',
                      textTransform: 'uppercase',
                    }}>
                      {order.payment_method} · {order.payment_status}
                    </span>
                  </div>
                </div>

                {/* Items Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #edf2f7', color: '#718096' }}>
                      <th style={{ padding: '6px 0' }}>Dish</th>
                      <th style={{ padding: '6px 0' }}>Price</th>
                      <th style={{ padding: '6px 0' }}>Qty</th>
                      <th style={{ padding: '6px 0', textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((it, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f7fafc' }}>
                        <td style={{ padding: '8px 0' }}>
                          <strong>{it.item_name}</strong>
                          {it.special_instructions && (
                            <div style={{ fontSize: '0.8rem', color: '#d97706' }}>
                              Note: "{it.special_instructions}"
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '8px 0' }}>₹{Number(it.item_price).toFixed(2)}</td>
                        <td style={{ padding: '8px 0' }}>{it.quantity}</td>
                        <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 600 }}>
                          ₹{Number(it.subtotal).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Address & Actions Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#555' }}>
                    <p style={{ margin: 0 }}>
                      <FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: '6px', color: 'var(--primary)' }} />
                      <strong>Address:</strong> {order.delivery_address}
                    </p>
                    <p style={{ margin: '3px 0 0 0' }}>
                      <FontAwesomeIcon icon={faPhone} style={{ marginRight: '6px', color: 'var(--primary)' }} />
                      <strong>Phone:</strong> {order.contact_phone}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
                      Total: ₹{Number(order.total_amount).toFixed(2)}
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                      onClick={() => handleReorder(order)}
                    >
                      <FontAwesomeIcon icon={faRedo} /> Reorder
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MyOrders;

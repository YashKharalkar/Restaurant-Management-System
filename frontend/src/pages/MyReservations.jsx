import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faPlus,
  faChair,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import api from '../api/axios';

const MyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const fetchReservations = async () => {
    try {
      const res = await api.get('/reservations/my-reservations');
      setReservations(res.data);
    } catch {
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Do you want to cancel this reservation?')) return;

    try {
      await api.patch(`/reservations/cancel/${id}`);
      setMsg('Reservation cancelled.');
      fetchReservations();
      setTimeout(() => setMsg(''), 3000);
    } catch {
      alert('Failed to cancel reservation.');
    }
  };

  return (
    <section className="section" style={{ backgroundColor: '#f5f9fb', minHeight: '80vh' }}>
      <div className="container">
        <div className="cart-page-header">
          <div>
            <h1>
              <FontAwesomeIcon icon={faCalendarAlt} /> My Reservations
            </h1>
            <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>
              View and manage your table bookings.
            </p>
          </div>
          <Link to="/book-table" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '8px 18px' }}>
            <FontAwesomeIcon icon={faPlus} /> Book New Table
          </Link>
        </div>

        {msg && <div className="alert alert-success" style={{ marginBottom: '20px' }}>{msg}</div>}

        {loading ? (
          <p className="spinner" style={{ textAlign: 'center', margin: '40px 0' }}>Loading reservations...</p>
        ) : reservations.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">
              <FontAwesomeIcon icon={faChair} />
            </div>
            <h2>No Reservations Found</h2>
            <p>You have not booked any tables yet.</p>
            <Link to="/book-table" className="btn btn-primary" style={{ marginTop: '15px' }}>
              <FontAwesomeIcon icon={faCalendarAlt} /> Book a Table Now
            </Link>
          </div>
        ) : (
          <div className="card" style={{ padding: '20px', background: '#fff' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Time Slot</th>
                  <th>Seating Zone</th>
                  <th>Guests</th>
                  <th>Special Request</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.id}>
                    <td><strong>#{r.id}</strong></td>
                    <td>{new Date(r.reservation_date).toLocaleDateString()}</td>
                    <td>{r.time_slot}</td>
                    <td>{r.seating_zone}</td>
                    <td>{r.guests_count}</td>
                    <td>{r.special_requests || '-'}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        backgroundColor: r.status === 'confirmed' ? '#c6f6d5' : r.status === 'cancelled' ? '#fed7d7' : '#edf2f7',
                        color: r.status === 'confirmed' ? '#22543d' : r.status === 'cancelled' ? '#9b2c2c' : '#4a5568',
                        textTransform: 'uppercase',
                      }}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      {r.status !== 'cancelled' && r.status !== 'completed' ? (
                        <button
                          type="button"
                          className="btn btn-danger"
                          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                          onClick={() => handleCancel(r.id)}
                        >
                          <FontAwesomeIcon icon={faTimesCircle} /> Cancel
                        </button>
                      ) : (
                        <span style={{ color: '#aaa', fontSize: '0.85rem' }}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default MyReservations;

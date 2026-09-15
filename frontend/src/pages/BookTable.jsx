import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faCheckCircle,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const BookTable = () => {
  const { user } = useAuth();
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(todayStr);
  const [seatingZone, setSeatingZone] = useState('Indoor Dining');
  const [timeSlot, setTimeSlot] = useState('');
  const [guestsCount, setGuestsCount] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');

  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      if (!name) setName(user.name);
      if (!email) setEmail(user.email);
    }
  }, [user]);

  // Fetch available slots when date or seating zone changes
  useEffect(() => {
    const fetchSlots = async () => {
      setLoadingSlots(true);
      setErrorMsg('');
      try {
        const res = await api.get(`/reservations/availability?date=${date}&zone=${encodeURIComponent(seatingZone)}`);
        setSlots(res.data.slots || []);
        const firstAvailable = res.data.slots?.find((s) => s.isAvailable);
        setTimeSlot(firstAvailable ? firstAvailable.time_slot : '');
      } catch {
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    if (date && seatingZone) {
      fetchSlots();
    }
  }, [date, seatingZone]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!timeSlot) {
      setErrorMsg('Please select an available time slot.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        reservation_date: date,
        time_slot: timeSlot,
        guests_count: guestsCount,
        seating_zone: seatingZone,
        special_requests: specialRequests,
      };

      const res = await api.post('/reservations/book', payload);
      setSuccessData(res.data.details || payload);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to book reservation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (successData) {
    return (
      <section className="section" style={{ backgroundColor: '#f5f9fb', minHeight: '80vh' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <div className="card" style={{ padding: '30px', textAlign: 'center', background: '#fff' }}>
            <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: '3rem', color: '#38a169', marginBottom: '15px' }} />
            <h2 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Table Booked Successfully!</h2>
            <p style={{ color: 'var(--text-gray)', marginBottom: '20px' }}>
              Your reservation has been confirmed. We look forward to serving you!
            </p>

            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', textAlign: 'left', marginBottom: '20px', fontSize: '0.9rem' }}>
              <p><strong>Name:</strong> {successData.customer_name}</p>
              <p><strong>Date:</strong> {successData.reservation_date}</p>
              <p><strong>Time Slot:</strong> {successData.time_slot}</p>
              <p><strong>Seating Area:</strong> {successData.seating_zone}</p>
              <p><strong>Guests:</strong> {successData.guests_count} Person(s)</p>
              {specialRequests && <p><strong>Special Request:</strong> {specialRequests}</p>}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {user ? (
                <Link to="/my-reservations" className="btn btn-primary">
                  View My Reservations
                </Link>
              ) : (
                <Link to="/menu" className="btn btn-primary">
                  Browse Menu
                </Link>
              )}
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setSuccessData(null)}
              >
                Book Another Table
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section" style={{ backgroundColor: '#f5f9fb', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '650px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 className="section-title">
            <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '10px' }} />
            Book a Table
          </h1>
          <p className="section-subtitle">Reserve a table at The Grand Table in simple steps</p>
        </div>

        {errorMsg && (
          <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <FontAwesomeIcon icon={faTimesCircle} /> {errorMsg}
          </div>
        )}

        <div className="card" style={{ padding: '30px', background: '#fff' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                  Reservation Date *
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="form-control"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                  Seating Area *
                </label>
                <select
                  value={seatingZone}
                  onChange={(e) => setSeatingZone(e.target.value)}
                  className="form-control"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}
                >
                  <option value="Indoor Dining">Indoor Dining</option>
                  <option value="Rooftop">Rooftop Lounge</option>
                  <option value="Outdoor Patio">Outdoor Garden</option>
                  <option value="Private Dining">Private Dining Room</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                  Time Slot *
                </label>
                {loadingSlots ? (
                  <p style={{ fontSize: '0.85rem', color: '#666', padding: '10px 0' }}>Loading slots...</p>
                ) : (
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="form-control"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}
                    required
                  >
                    {slots.map((s) => (
                      <option key={s.time_slot} value={s.time_slot} disabled={!s.isAvailable}>
                        {s.time_slot} {s.isAvailable ? `(${s.remainingSeats} seats left)` : '(Full)'}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                  Number of Guests *
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(e.target.value)}
                  className="form-control"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                Your Name *
              </label>
              <input
                type="text"
                placeholder="Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-control"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="rahul.sharma@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-control"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                Special Request (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Birthday celebration, Window seat"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="form-control"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
              disabled={submitting || !timeSlot}
            >
              {submitting ? 'Booking Table...' : 'Confirm Table Booking'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default BookTable;

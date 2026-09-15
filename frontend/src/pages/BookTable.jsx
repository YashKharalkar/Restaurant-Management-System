import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faCheckCircle,
  faTimesCircle,
  faChair,
  faClock,
  faUsers,
  faUser,
  faEnvelope,
  faPhone,
  faCommentDots,
  faUtensils,
  faReceipt,
  faArrowRight,
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
      <div>
        <div
          className="page-header"
          style={{
            backgroundImage: `
              linear-gradient(135deg, rgba(14,77,100,0.80) 0%, rgba(26,127,168,0.72) 100%),
              url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=85')
            `,
          }}
        >
          <h1>Booking Confirmed!</h1>
          <p>We are delighted to welcome you to The Grand Table</p>
        </div>

        <section className="section" style={{ backgroundColor: '#f5f9fb', minHeight: '60vh' }}>
          <div className="container" style={{ maxWidth: '580px' }}>
            <div className="card" style={{ padding: '36px', textAlign: 'center', background: '#fff', borderRadius: '12px' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#def7ec', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: '2.4rem', color: '#059669' }} />
              </div>
              <h2 style={{ color: 'var(--primary)', marginBottom: '8px', fontSize: '1.5rem' }}>Reservation Confirmed</h2>
              <p style={{ color: 'var(--text-gray)', marginBottom: '22px', fontSize: '0.92rem' }}>
                Your table booking details have been saved.
              </p>

              <div style={{ background: '#f8fafc', border: '1px solid var(--border)', padding: '18px', borderRadius: '10px', textAlign: 'left', marginBottom: '24px', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ margin: 0 }}><strong>Guest Name:</strong> {successData.customer_name}</p>
                <p style={{ margin: 0 }}><strong>Date:</strong> {successData.reservation_date}</p>
                <p style={{ margin: 0 }}><strong>Time Slot:</strong> {successData.time_slot}</p>
                <p style={{ margin: 0 }}><strong>Seating Area:</strong> {successData.seating_zone}</p>
                <p style={{ margin: 0 }}><strong>Guests:</strong> {successData.guests_count} Person(s)</p>
                {specialRequests && <p style={{ margin: 0 }}><strong>Special Request:</strong> {specialRequests}</p>}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {user ? (
                  <Link to="/my-reservations" className="btn btn-primary" style={{ padding: '10px 22px', fontSize: '0.9rem' }}>
                    <FontAwesomeIcon icon={faReceipt} style={{ marginRight: '6px' }} /> View My Reservations
                  </Link>
                ) : (
                  <Link to="/menu" className="btn btn-primary" style={{ padding: '10px 22px', fontSize: '0.9rem' }}>
                    <FontAwesomeIcon icon={faUtensils} style={{ marginRight: '6px' }} /> Browse Menu
                  </Link>
                )}
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ padding: '10px 22px', fontSize: '0.9rem' }}
                  onClick={() => setSuccessData(null)}
                >
                  Book Another Table
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <div
        className="page-header"
        style={{
          backgroundImage: `
            linear-gradient(135deg, rgba(14,77,100,0.80) 0%, rgba(26,127,168,0.72) 100%),
            url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=85')
          `,
        }}
      >
        <h1>Book a Table</h1>
        <p>Reserve your dining experience at The Grand Table</p>
      </div>

      <section className="section" style={{ backgroundColor: '#f5f9fb', minHeight: '80vh' }}>
        <div className="container" style={{ maxWidth: '650px' }}>
          {errorMsg && (
            <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <FontAwesomeIcon icon={faTimesCircle} /> {errorMsg}
            </div>
          )}

          <div className="card" style={{ padding: '36px', background: '#fff', borderRadius: '12px' }}>
            <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--primary)', margin: 0 }}>
                Table Reservation Form
              </h2>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
                Fill in the details below to secure your table.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                    <FontAwesomeIcon icon={faCalendarAlt} style={{ color: 'var(--primary)' }} /> Reservation Date *
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                    <FontAwesomeIcon icon={faChair} style={{ color: 'var(--primary)' }} /> Seating Area *
                  </label>
                  <select
                    value={seatingZone}
                    onChange={(e) => setSeatingZone(e.target.value)}
                    required
                  >
                    <option value="Indoor Dining">Indoor Dining</option>
                    <option value="Rooftop">Rooftop Lounge</option>
                    <option value="Outdoor Patio">Outdoor Garden</option>
                    <option value="Private Dining">Private Dining Room</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                    <FontAwesomeIcon icon={faClock} style={{ color: 'var(--primary)' }} /> Time Slot *
                  </label>
                  {loadingSlots ? (
                    <p style={{ fontSize: '0.85rem', color: '#666', padding: '10px 0' }}>Loading available slots...</p>
                  ) : (
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
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

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                    <FontAwesomeIcon icon={faUsers} style={{ color: 'var(--primary)' }} /> Number of Guests *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(e.target.value)}
                    placeholder="2"
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                  <FontAwesomeIcon icon={faUser} style={{ color: 'var(--primary)' }} /> Your Name *
                </label>
                <input
                  type="text"
                  placeholder="Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                    <FontAwesomeIcon icon={faEnvelope} style={{ color: 'var(--primary)' }} /> Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="rahul.sharma@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                    <FontAwesomeIcon icon={faPhone} style={{ color: 'var(--primary)' }} /> Phone Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                  <FontAwesomeIcon icon={faCommentDots} style={{ color: 'var(--primary)' }} /> Special Request (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Birthday celebration, Window seat"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary form-btn"
                style={{ width: '100%', padding: '14px', fontSize: '0.95rem' }}
                disabled={submitting || !timeSlot}
              >
                {submitting ? 'Booking Table...' : (
                  <>
                    <FontAwesomeIcon icon={faUtensils} style={{ marginRight: '8px' }} />
                    Confirm Table Booking
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BookTable;

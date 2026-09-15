const db = require('../config/db');

// Capacity configuration per seating zone per time slot
const ZONE_CAPACITIES = {
  'Indoor Dining': { maxGuests: 24, maxBookings: 6 },
  'Rooftop': { maxGuests: 20, maxBookings: 5 },
  'Outdoor Patio': { maxGuests: 16, maxBookings: 4 },
  'Private Dining': { maxGuests: 12, maxBookings: 2 },
};

const STANDARD_TIME_SLOTS = [
  '12:00 PM - 01:30 PM',
  '01:30 PM - 03:00 PM',
  '03:00 PM - 04:30 PM',
  '07:00 PM - 08:30 PM',
  '08:30 PM - 10:00 PM',
  '10:00 PM - 11:30 PM',
];

// Check slot availability for a given date and zone
const getAvailability = async (req, res) => {
  const { date, zone } = req.query;

  if (!date) {
    return res.status(400).json({ message: 'Reservation date is required' });
  }

  const seatingZone = zone || 'Indoor Dining';
  const capacityRule = ZONE_CAPACITIES[seatingZone] || { maxGuests: 20, maxBookings: 5 };

  try {
    const [rows] = await db.query(
      `SELECT time_slot, SUM(guests_count) as total_guests, COUNT(*) as total_bookings
       FROM reservations
       WHERE reservation_date = ? AND seating_zone = ? AND status != 'cancelled'
       GROUP BY time_slot`,
      [date, seatingZone]
    );

    const bookedMap = {};
    rows.forEach((r) => {
      bookedMap[r.time_slot] = {
        guests: Number(r.total_guests || 0),
        bookings: Number(r.total_bookings || 0),
      };
    });

    const slots = STANDARD_TIME_SLOTS.map((slot) => {
      const booked = bookedMap[slot] || { guests: 0, bookings: 0 };
      const remainingSeats = Math.max(0, capacityRule.maxGuests - booked.guests);
      const isAvailable = remainingSeats > 0 && booked.bookings < capacityRule.maxBookings;

      return {
        time_slot: slot,
        isAvailable,
        remainingSeats,
        maxSeats: capacityRule.maxGuests,
        currentBooked: booked.guests,
      };
    });

    res.json({
      date,
      zone: seatingZone,
      slots,
      zones: Object.keys(ZONE_CAPACITIES),
    });
  } catch (err) {
    res.status(500).json({ message: 'Error checking availability', error: err.message });
  }
};

// Book a table with conflict & capacity prevention
const bookReservation = async (req, res) => {
  const {
    customer_name,
    customer_email,
    customer_phone,
    reservation_date,
    time_slot,
    guests_count,
    seating_zone,
    special_requests,
  } = req.body;

  if (
    !customer_name ||
    !customer_email ||
    !customer_phone ||
    !reservation_date ||
    !time_slot ||
    !guests_count ||
    !seating_zone
  ) {
    return res.status(400).json({ message: 'All booking fields are required.' });
  }

  const guests = parseInt(guests_count, 10);
  if (isNaN(guests) || guests < 1 || guests > 20) {
    return res.status(400).json({ message: 'Party size must be between 1 and 20 guests.' });
  }

  // Validate date is not in the past
  const bookingDate = new Date(reservation_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (bookingDate < today) {
    return res.status(400).json({ message: 'Reservation date cannot be in the past.' });
  }

  const capacityRule = ZONE_CAPACITIES[seatingZoneSafe(seating_zone)] || { maxGuests: 20, maxBookings: 5 };

  try {
    // Check existing confirmed/seated/pending bookings for conflict
    const [existing] = await db.query(
      `SELECT SUM(guests_count) as total_guests, COUNT(*) as total_bookings
       FROM reservations
       WHERE reservation_date = ? AND time_slot = ? AND seating_zone = ? AND status != 'cancelled'`,
      [reservation_date, time_slot, seating_zone]
    );

    const currentGuests = Number(existing[0]?.total_guests || 0);
    const currentBookings = Number(existing[0]?.total_bookings || 0);

    if (currentGuests + guests > capacityRule.maxGuests || currentBookings >= capacityRule.maxBookings) {
      const remaining = Math.max(0, capacityRule.maxGuests - currentGuests);
      return res.status(409).json({
        message: `Capacity limit reached for ${seating_zone} at ${time_slot}. Only ${remaining} seat(s) available. Please choose another time slot or seating zone.`,
        remainingSeats: remaining,
      });
    }

    const userId = req.user ? req.user.id : null;

    const [result] = await db.query(
      `INSERT INTO reservations 
        (user_id, customer_name, customer_email, customer_phone, reservation_date, time_slot, guests_count, seating_zone, special_requests, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        customer_name,
        customer_email,
        customer_phone,
        reservation_date,
        time_slot,
        guests,
        seating_zone,
        special_requests || '',
        'confirmed',
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Reservation confirmed successfully!',
      reservationId: result.insertId,
      details: {
        id: result.insertId,
        customer_name,
        reservation_date,
        time_slot,
        guests_count: guests,
        seating_zone,
        status: 'confirmed',
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to book table', error: err.message });
  }
};

const seatingZoneSafe = (zone) => {
  return ZONE_CAPACITIES[zone] ? zone : 'Indoor Dining';
};

// Customer: Get my reservations
const getMyReservations = async (req, res) => {
  try {
    const userId = req.user.id;
    const [reservations] = await db.query(
      'SELECT * FROM reservations WHERE user_id = ? ORDER BY reservation_date DESC, id DESC',
      [userId]
    );
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reservations', error: err.message });
  }
};

// Customer / Admin: Cancel a reservation
const cancelReservation = async (req, res) => {
  const { id } = req.params;
  try {
    const [existing] = await db.query('SELECT * FROM reservations WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const reservation = existing[0];
    if (req.user.role !== 'admin' && reservation.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await db.query("UPDATE reservations SET status = 'cancelled' WHERE id = ?", [id]);
    res.json({ message: 'Reservation has been cancelled successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to cancel reservation', error: err.message });
  }
};

// Admin: Get all reservations with optional filters
const getAllReservations = async (req, res) => {
  const { date, zone, status } = req.query;

  try {
    let query = 'SELECT * FROM reservations WHERE 1=1';
    const params = [];

    if (date) {
      query += ' AND reservation_date = ?';
      params.push(date);
    }
    if (zone) {
      query += ' AND seating_zone = ?';
      params.push(zone);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY reservation_date DESC, id DESC';

    const [reservations] = await db.query(query, params);
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reservations', error: err.message });
  }
};

// Admin: Update reservation status
const updateReservationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['confirmed', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Valid values: ${validStatuses.join(', ')}` });
  }

  try {
    const [result] = await db.query('UPDATE reservations SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    res.json({ message: `Reservation marked as ${status}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update reservation', error: err.message });
  }
};

module.exports = {
  getAvailability,
  bookReservation,
  getMyReservations,
  cancelReservation,
  getAllReservations,
  updateReservationStatus,
  ZONE_CAPACITIES,
  STANDARD_TIME_SLOTS,
};

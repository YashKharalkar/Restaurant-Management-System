import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import api from '../api/axios';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setLoading(true);

    try {
      const res = await api.post('/contact', form);
      setStatus({ type: 'success', message: res.data.message });
      setForm({ name: '', email: '', message: '' }); // Reset form
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div
        className="page-header"
        style={{
          backgroundImage: `
            linear-gradient(135deg, rgba(14,77,100,0.80) 0%, rgba(26,127,168,0.72) 100%),
            url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=85')
          `,
        }}
      >
        <h1>Contact Us</h1>
        <p>We'd love to hear from you</p>
      </div>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Info */}
            <div className="contact-info">
              <h3>Get In Touch</h3>

              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                </div>
                <div className="contact-info-text">
                  <h4>Address</h4>
                  <p>123 Main Street, Colaba, Mumbai, Maharashtra 400001</p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <FontAwesomeIcon icon={faPhone} />
                </div>
                <div className="contact-info-text">
                  <h4>Phone</h4>
                  <p>+91 98765 43210</p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <FontAwesomeIcon icon={faEnvelope} />
                </div>
                <div className="contact-info-text">
                  <h4>Email</h4>
                  <p>info@grandtable.com</p>
                </div>
              </div>

              {/* Google Maps Embed — replace src with your actual location */}
              <div className="map-embed">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3774.103!2d72.8328!3d18.9220!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7d1c73a0becd9%3A0xd1f5b0f2e9a0f5c0!2sColaba%2C%20Mumbai!5e0!3m2!1sen!2sin!4v1700000000000"
                  allowFullScreen=""
                  loading="lazy"
                  title="Restaurant Location"
                />
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <div className="form-container" style={{ margin: 0, boxShadow: 'none', padding: '0' }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: '24px', fontSize: '1.4rem' }}>Send a Message</h3>

                {status.message && (
                  <div className={`alert alert-${status.type}`}>{status.message}</div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Your Name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Message</label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Write your message here..."
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary form-btn" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;

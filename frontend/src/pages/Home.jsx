import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faArrowRight, faClock, faMapMarkerAlt, faPhone } from '@fortawesome/free-solid-svg-icons';
import api from '../api/axios';
import DishCard from '../components/DishCard';

const Home = () => {
  const [featured, setFeatured] = useState([]);

  // Fetch first 3 menu items to show as "featured dishes"
  useEffect(() => {
    api.get('/menu').then((res) => setFeatured(res.data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section
        className="hero"
        style={{
          backgroundImage: `
            linear-gradient(135deg, rgba(14,77,100,0.83) 0%, rgba(26,127,168,0.76) 100%),
            url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=85')
          `,
        }}
      >
        <div className="container">
          <h1>🍽️ Welcome to The Grand Table</h1>
          <p>Experience the finest flavors crafted with passion, fresh ingredients, and love.</p>
          <Link to="/menu" className="btn btn-white">
            Explore Our Menu &nbsp;<FontAwesomeIcon icon={faArrowRight} />
          </Link>
        </div>
      </section>

      {/* Featured Dishes */}
      <section className="section" style={{ backgroundColor: '#f5f9fb' }}>
        <div className="container">
          <h2 className="section-title">
            <FontAwesomeIcon icon={faStar} style={{ marginRight: '10px', color: '#f6ad55' }} />
            Featured Dishes
          </h2>
          <p className="section-subtitle">A taste of what awaits you</p>

          {featured.length > 0 ? (
            <div className="dish-grid">
              {featured.map((item) => (
                <DishCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="spinner">Loading...</p>
          )}

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/menu" className="btn btn-primary">
              View Full Menu &nbsp;<FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Info Strip */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px', textAlign: 'center' }}>
            {[
              { icon: faClock, label: 'Open Daily', value: '11 AM – 11 PM' },
              { icon: faMapMarkerAlt, label: 'Location', value: '123 Main Street, Mumbai' },
              { icon: faPhone, label: 'Reservations', value: '+91 98765 43210' },
            ].map((info) => (
              <div key={info.label} className="timing-card">
                <div style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--primary)' }}>
                  <FontAwesomeIcon icon={info.icon} />
                </div>
                <h4>{info.label}</h4>
                <p>{info.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

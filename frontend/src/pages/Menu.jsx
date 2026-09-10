import { useEffect, useState } from 'react';
import api from '../api/axios';
import DishCard from '../components/DishCard';
import SearchBar from '../components/SearchBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils } from '@fortawesome/free-solid-svg-icons';

const Menu = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/menu?search=${search}`)
      .then((res) => setItems(res.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div>
      <div
        className="page-header"
        style={{
          backgroundImage: `
            linear-gradient(135deg, rgba(14,77,100,0.80) 0%, rgba(26,127,168,0.72) 100%),
            url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=85')
          `,
        }}
      >
        <h1>Our Menu</h1>
        <p>Explore a wide variety of dishes crafted just for you</p>
      </div>

      <section className="section">
        <div className="container">
          <SearchBar value={search} onChange={setSearch} placeholder="Search dishes by name..." />

          {loading ? (
            <p className="spinner">Loading menu...</p>
          ) : items.length > 0 ? (
            <div className="dish-grid">
              {items.map((item) => (
                <DishCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <FontAwesomeIcon icon={faUtensils} style={{ fontSize: '2.5rem', color: '#ccc' }} />
              <p>No dishes found{search ? ` for "${search}"` : ''}.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Menu;

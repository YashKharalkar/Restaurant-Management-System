import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faUser, faSignOutAlt, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-logo">
          <FontAwesomeIcon icon={faUtensils} />
          <span>The Grand Table</span>
        </Link>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span /><span /><span />
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={isActive('/')} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/menu" className={isActive('/menu')} onClick={() => setMenuOpen(false)}>Menu</Link>
          <Link to="/about" className={isActive('/about')} onClick={() => setMenuOpen(false)}>About</Link>
          <Link to="/contact" className={isActive('/contact')} onClick={() => setMenuOpen(false)}>Contact</Link>

          {user ? (
            <>
              <Link to="/payment" className={`cart-link ${isActive('/payment')}`} onClick={() => setMenuOpen(false)}>
                <FontAwesomeIcon icon={faShoppingCart} />
                <span>Cart</span>
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className="btn btn-outline" onClick={() => setMenuOpen(false)}>
                  Admin
                </Link>
              )}
              <button className="btn btn-primary" onClick={handleLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={`btn btn-outline ${isActive('/login')}`} onClick={() => setMenuOpen(false)}>
                <FontAwesomeIcon icon={faUser} /> Login
              </Link>
              <Link to="/signup" className={`btn btn-primary ${isActive('/signup')}`} onClick={() => setMenuOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

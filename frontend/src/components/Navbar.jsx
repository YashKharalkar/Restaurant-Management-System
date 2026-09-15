import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUtensils,
  faSignOutAlt,
  faShoppingCart,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => (location.pathname === path ? 'active' : '');

  const isAdminTabActive = (tab) => {
    if (!location.pathname.startsWith('/admin')) return '';
    const searchParams = new URLSearchParams(location.search);
    const currentTab = searchParams.get('tab') || 'menu';
    return currentTab === tab ? 'active' : '';
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="container navbar-container">
        {/* Brand Logo */}
        <Link to={user?.role === 'admin' ? '/menu' : '/'} className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <FontAwesomeIcon icon={faUtensils} className="logo-icon" />
          <span>The Grand Table</span>
        </Link>

        {/* Mobile Hamburger Toggle */}
        <button
          className={`hamburger ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span />
          <span />
          <span />
        </button>

        {/* Navigation Menu */}
        <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
          {/* 1. ADMIN NAVBAR */}
          {user && user.role === 'admin' ? (
            <>
              <nav className="nav-center-links">
                <Link
                  to="/menu"
                  className={`nav-link ${isActive('/menu')}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Menu
                </Link>
                <Link
                  to="/admin/dashboard?tab=menu"
                  className={`nav-link ${isAdminTabActive('menu')}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Menu Items
                </Link>
                <Link
                  to="/admin/dashboard?tab=orders"
                  className={`nav-link ${isAdminTabActive('orders')}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Orders
                </Link>
                <Link
                  to="/admin/dashboard?tab=reservations"
                  className={`nav-link ${isAdminTabActive('reservations')}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Reservations
                </Link>
                <Link
                  to="/admin/dashboard?tab=contacts"
                  className={`nav-link ${isAdminTabActive('contacts')}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Inquiries
                </Link>
              </nav>

              <div className="nav-right-actions">
                <button type="button" className="nav-logout-btn" onClick={handleLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                </button>
              </div>
            </>
          ) : (
            /* 2. CUSTOMER & GUEST NAVBAR */
            <>
              {/* Sequence: Home, Menu, Book Table, Orders, Reservations, About, Contact */}
              <nav className="nav-center-links">
                <Link to="/" className={`nav-link ${isActive('/')}`} onClick={() => setMenuOpen(false)}>
                  Home
                </Link>
                <Link to="/menu" className={`nav-link ${isActive('/menu')}`} onClick={() => setMenuOpen(false)}>
                  Menu
                </Link>
                <Link to="/book-table" className={`nav-link ${isActive('/book-table')}`} onClick={() => setMenuOpen(false)}>
                  Book Table
                </Link>

                {/* Orders & Reservations only for logged-in Customer */}
                {user && (
                  <>
                    <Link
                      to="/orders"
                      className={`nav-link ${isActive('/orders')}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      Orders
                    </Link>
                    <Link
                      to="/my-reservations"
                      className={`nav-link ${isActive('/my-reservations')}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      Reservations
                    </Link>
                  </>
                )}

                <Link to="/about" className={`nav-link ${isActive('/about')}`} onClick={() => setMenuOpen(false)}>
                  About
                </Link>
                <Link to="/contact" className={`nav-link ${isActive('/contact')}`} onClick={() => setMenuOpen(false)}>
                  Contact
                </Link>
              </nav>

              {/* Right Action Bar: Cart then Logout / Login */}
              <div className="nav-right-actions">
                <Link
                  to="/payment"
                  className={`nav-cart-btn ${isActive('/payment')}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <FontAwesomeIcon icon={faShoppingCart} />
                  <span>Cart</span>
                  {cartCount > 0 && <span className="cart-badge-count">{cartCount}</span>}
                </Link>

                {user ? (
                  <button type="button" className="nav-logout-btn" onClick={handleLogout}>
                    <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                  </button>
                ) : (
                  <div className="nav-auth-buttons">
                    <Link
                      to="/login"
                      className={`nav-auth-login-btn ${isActive('/login')}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <FontAwesomeIcon icon={faUser} style={{ marginRight: '6px' }} /> Login
                    </Link>
                    <Link
                      to="/signup"
                      className={`nav-auth-signup-btn ${isActive('/signup')}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

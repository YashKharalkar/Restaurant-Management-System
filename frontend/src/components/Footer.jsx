import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faMapMarkerAlt, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faInstagram, faTwitter } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="navbar-logo" style={{ marginBottom: '14px' }}>
              <FontAwesomeIcon icon={faUtensils} />
              <span style={{ color: '#fff' }}>The Grand Table</span>
            </div>
            <p style={{ fontSize: '0.88rem', marginBottom: '16px' }}>
              A fine dining experience crafted with passion, flavor, and warmth.
            </p>
            <div className="social-icons">
              <a href="#" className="social-icon" aria-label="Facebook">
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
              <a href="#" className="social-icon" aria-label="Instagram">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a href="#" className="social-icon" aria-label="Twitter">
                <FontAwesomeIcon icon={faTwitter} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/menu">Menu</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-title">Contact Us</h4>
            <div className="footer-contact-item">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              <span>123 Main Street, Mumbai, Maharashtra 400001</span>
            </div>
            <div className="footer-contact-item">
              <FontAwesomeIcon icon={faPhone} />
              <span>+91 98765 43210</span>
            </div>
            <div className="footer-contact-item">
              <FontAwesomeIcon icon={faEnvelope} />
              <span>info@grandtable.com</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} The Grand Table. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

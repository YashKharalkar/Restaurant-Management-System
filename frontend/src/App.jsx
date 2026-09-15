import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Menu from './pages/Menu';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Payment from './pages/Payment';
import MyOrders from './pages/MyOrders';
import BookTable from './pages/BookTable';
import MyReservations from './pages/MyReservations';

import AdminDashboard from './pages/admin/AdminDashboard';
import AddMenuItem from './pages/admin/AddMenuItem';
import EditMenuItem from './pages/admin/EditMenuItem';

const AuthLayout = ({ children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f5f9fb' }}>
    {children}
    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-gray)', fontSize: '0.9rem', marginTop: 'auto' }}>
      &copy; {new Date().getFullYear()} The Grand Table. All rights reserved.
    </div>
  </div>
);

const App = () => {
  return (
    <CartProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/admin/login" element={<AuthLayout><Login /></AuthLayout>} />
            <Route
              path="/admin/dashboard"
              element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>}
            />
            <Route
              path="/admin/add"
              element={<ProtectedRoute role="admin"><AddMenuItem /></ProtectedRoute>}
            />
            <Route
              path="/admin/edit/:id"
              element={<ProtectedRoute role="admin"><EditMenuItem /></ProtectedRoute>}
            />

            <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
            <Route path="/signup" element={<AuthLayout><Signup /></AuthLayout>} />

            <Route
              path="/*"
              element={
                <>
                  <Navbar />
                  <main>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/menu" element={<Menu />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/book-table" element={<BookTable />} />
                      
                      <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
                      <Route path="/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                      <Route path="/my-reservations" element={<ProtectedRoute><MyReservations /></ProtectedRoute>} />

                    </Routes>
                  </main>
                  <Footer />
                </>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </CartProvider>
  );
};

export default App;


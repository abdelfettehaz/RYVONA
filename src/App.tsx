import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import DesignStudio from './pages/DesignStudio';
import MyDesigns from './pages/MyDesigns';
import Templates from './pages/Templates';
import Gallery from './pages/Gallery';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import Admin from './pages/Admin';
import AdminDashboard from './pages/AdminDashboard';
import ChatWidget from './components/ChatWidget';
import OrderAdmin from './pages/OrderAdmin';
import AIGenerator from './pages/AIGenerator';
import ClientChat from './pages/ClientChat';
import AdminChat from './pages/AdminChat';
import AboutUs from './pages/about';
import JourneyPage from './pages/career';
import { PrivacyPolicyPage } from './pages/Privacy';
import {TermsOfServicePage } from './pages/Terms';
import { CommunityRulesPage as RulesPage } from './pages/rules';
import Blog from './pages/blog';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/Login" replace />;
};

// Private Route Component
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/Login" replace />;
  }
  return <>{children}</>;
};

// Admin Route Component
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!token) {
    return <Navigate to="/Login" replace />;
  }
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <main className="flex-grow w-full px-4 py-8 mt-16">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/career" element={<JourneyPage/>} />
            <Route path="/Privacy" element={<PrivacyPolicyPage />} />
            <Route path="/Terms" element={<TermsOfServicePage />} />
            <Route path="/Rules" element={<RulesPage />} />
            <Route path="/blog" element={<Blog />} />

            {/* Protected Routes */}
            <Route path="/design-studio" element={<ProtectedRoute><DesignStudio /></ProtectedRoute>} />
            <Route path="/ai-generator" element={<ProtectedRoute><AIGenerator /></ProtectedRoute>} />
            <Route path="/my-designs" element={<ProtectedRoute><MyDesigns/></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
            <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
            <Route path="/ClientChat" element={
              <PrivateRoute>
                <ClientChat />
              </PrivateRoute>
            } />
            <Route path="/AdminChat" element={
              <AdminRoute>
                <AdminChat />
              </AdminRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/orderadmin" element={<AdminRoute><OrderAdmin /></AdminRoute>} />

            {/* Redirect old paths to new ones for robustness */}
            <Route path="/DesignStudio" element={<Navigate to="/design-studio" replace />} />
            <Route path="/MyDesigns" element={<Navigate to="/my-designs" replace />} />
            <Route path="/Orders" element={<Navigate to="/orders" replace />} />
            <Route path="/Profile" element={<Navigate to="/profile" replace />} />
            <Route path="/Payment" element={<Navigate to="/payment" replace />} />
            <Route path="/PaymentSuccess" element={<Navigate to="/payment-success" replace />} />
            <Route path="/Admin" element={<Navigate to="/admin" replace />} />
            <Route path="/AdminDashboard" element={<Navigate to="/admin-dashboard" replace />} />
            <Route path="/OrderAdmin" element={<Navigate to="/orderadmin" replace />} />
            <Route path="/ClientChat" element={<Navigate to="/ClientChat" replace />} />
            <Route path="/AdminChat" element={<Navigate to="/AdminChat" replace />} />

            {/* Catch all route */}
            <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
        </main>
        <Footer />
        <ChatWidget />
      </div>
    </Router>
  );
};

export default App;

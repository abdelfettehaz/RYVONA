import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../services/api';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, User, Settings, LogOut, ShoppingBag, Palette, Home, LayoutTemplate, Image, DollarSign, MessageCircle, Menu, X } from 'lucide-react';
const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const isAuthenticated = !!localStorage.getItem('token');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(getApiUrl('/chat/get_notifications.php'), {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Notifications API response:', data);
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      } else {
        const errorText = await response.text();
        console.error('Error response:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const deleteNotifications = async (notificationIds: number[] = []) => {
    try {
      const response = await fetch(getApiUrl('/chat/mark_notifications_read.php'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notification_ids: notificationIds }),
        credentials: 'include',
      });

      if (response.ok) {
        fetchNotifications();
      } else {
        console.error('Error deleting notifications:', response.status);
      }
    } catch (error) {
      console.error('Error deleting notifications:', error);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/DesignStudio', label: 'Design Studio', icon: Palette },
    { path: '/templates', label: 'Templates', icon: LayoutTemplate },
    { path: '/gallery', label: 'Gallery', icon: Image },
    { path: '/pricing', label: 'Pricing', icon: DollarSign },
    { path: '/contact', label: 'Contact', icon: MessageCircle },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
        : 'bg-white/80 backdrop-blur-sm'
    }`}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-17">
          <Link to="/" className="flex items-center">
            <img 
              src="https://i.postimg.cc/L8Nt4QkN/Chat-GPT-Image-Aug-15-2025-02-21-38-AM.png"
              alt="RYVONA DESIGN YOUR WAY"
              className="w-24 h-16 sm:w-32 sm:h-20 object-contain"
            />
          </Link>

          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex lg:hidden items-center space-x-4">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated ? (
              <>
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => {
                      setIsNotificationsOpen(!isNotificationsOpen);
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                  >
                    <Bell size={20} className="text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[100] max-w-[calc(100vw-2rem)] sm:max-w-none dropdown-menu">
                      <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                        {notifications.length > 0 && (
                          <button 
                            onClick={() => deleteNotifications()}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                      {notifications.length > 0 ? (
                        <div className="max-h-64 overflow-y-auto">
                          {notifications.map((notification) => (
                            <div 
                              key={notification.id} 
                              className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${notification.is_read ? 'opacity-70' : 'bg-blue-50'}`}
                              onClick={() => {
                                if (notification.type === 'message' && notification.related_id) {
                                  const path = isAdmin ? '/AdminChat' : '/ClientChat';
                                  navigate(path, { state: { conversationId: notification.related_id } });
                                  setIsNotificationsOpen(false);
                                  if (!notification.is_read) {
                                    deleteNotifications([notification.id]);
                                  }
                                }
                              }}
                            >
                              <p className="text-sm text-gray-800">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notification.created_at).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="px-4 py-8 text-center">
                          <p className="text-sm text-gray-500">No notifications</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.firstname?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {user?.firstname || 'User'}
                    </span>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[100] max-w-[calc(100vw-2rem)] sm:max-w-none dropdown-menu">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">
                          {user?.firstname} {user?.lastname}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <User size={16} className="mr-3" />
                          Profile
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <ShoppingBag size={16} className="mr-3" />
                          My Orders
                        </Link>
                        <Link
                          to="/my-designs"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Palette size={16} className="mr-3" />
                          My Designs
                        </Link>
                        {isAdmin ? (
                          <>
                            <Link
                              to="/admin"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Settings size={16} className="mr-3" />
                              Admin Dashboard
                            </Link>
                            <Link
                              to="/orderadmin"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Settings size={16} className="mr-3" />
                              Order Admin
                            </Link>
                            <Link
                              to="/AdminChat"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <MessageCircle size={16} className="mr-3" />
                              Admin Chat
                            </Link>
                          </>
                        ) : (
                          <Link
                            to="/ClientChat"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <MessageCircle size={16} className="mr-3" />
                            Chat with Support
                          </Link>
                        )}
                      </div>
                      <div className="border-t border-gray-100 py-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut size={16} className="mr-3" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors text-sm sm:text-base"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
                >
                  Sign Up
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X size={20} className="text-gray-600" />
              ) : (
                <Menu size={20} className="text-gray-600" />
              )}
              
            </button>
          </div>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[100] max-w-[calc(100vw-2rem)] dropdown-menu">
                      <div className="py-1">
                        <Link
                          to="/"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Home size={16} className="mr-3" />
                          Home
                        </Link>
                        <Link
                          to="/design-studio"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Palette size={16} className="mr-3" />
                          Design Studio
                        </Link>
                        <Link
                          to="/templates"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <LayoutTemplate size={16} className="mr-3" />
                          Templates
                        </Link>
                        <Link
                          to="/gallery"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Image size={16} className="mr-3" />
                          Gallery
                        </Link>
                        <Link
                          to="/pricing"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <DollarSign size={16} className="mr-3" />
                          Pricing
                        </Link>
                        <Link
                          to="/contact"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <MessageCircle size={16} className="mr-3" />
                          Contact
                        </Link>

                      </div>
                    </div>
      )}

      {(isDropdownOpen || isNotificationsOpen || isMobileMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsDropdownOpen(false);
            setIsNotificationsOpen(false);
            setIsMobileMenuOpen(false);
          }}
        />
      )}
    </nav>
  );
};

export default Navbar;

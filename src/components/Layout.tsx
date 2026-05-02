import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Zap, 
  Menu, 
  X, 
  LayoutDashboard, 
  Users, 
  User as UserIcon, 
  PlusCircle, 
  FolderHeart,
  LogOut,
  Bell,
  Search,
  ThumbsUp,
  MessageSquare,
  Clock,
  Sun,
  Moon,
  Twitter,
  Instagram,
  Linkedin,
  Video,
  Camera,
  ArrowRight,
  Wallet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';

interface Notification {
  _id: string;
  type: 'like' | 'comment';
  isRead: boolean;
  createdAt: string;
  senderUserId: {
    username: string;
    profileImage: string;
  };
  postId: {
    _id: string;
    title: string;
  };
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    posts: any[];
    users: any[];
  }>({ posts: [], users: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Polling every minute for new notifications
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
          if (res.ok) {
            const data = await res.json();
            setSearchResults(data);
            setShowSearchResults(true);
          }
        } catch (err) {
          console.error("Search failed", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults({ posts: [], users: [] });
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search results when navigation occurs
  useEffect(() => {
    setShowSearchResults(false);
  }, [location.pathname]);

  const handleMarkAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      const res = await fetch('/api/notifications/read', { method: 'PATCH' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error("Failed to mark notifications as read", err);
    }
  };

  useEffect(() => {
    if (notificationsOpen) {
      handleMarkAsRead();
    }
  }, [notificationsOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Communities', path: '/communities', icon: <Users size={20} /> },
    { name: 'Profile', path: '/profile', icon: <UserIcon size={20} /> },
    { name: 'Upload Content', path: '/upload', icon: <PlusCircle size={20} /> },
    { name: 'Your Content', path: '/my-content', icon: <FolderHeart size={20} /> },
    { name: 'Credit History', path: '/credits/history', icon: <Wallet size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-bg-base text-text-base flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-bg-base border-b border-border-subtle flex items-center justify-between px-4 md:px-8 z-[100] shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <Menu size={24} />
          </button>
          <Link to="/" className="text-xl md:text-2xl font-bold tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-lime rounded-lg flex items-center justify-center">
              <Zap size={20} className="text-black" />
            </div>
            <span className="hidden sm:inline">Xpert Ads</span>
          </Link>
        </div>

        <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
          <div className="flex w-full relative">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim().length >= 2 && setShowSearchResults(true)}
              placeholder="Search campaigns or creators..." 
              className="w-full h-10 bg-gray-50 dark:bg-gray-900 border border-border-subtle rounded-full pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime transition-all text-gray-600 placeholder:text-gray-400 dark:text-gray-300 dark:placeholder:text-gray-500"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            
            {/* Search Loading Indicator */}
            {isSearching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-brand-lime border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {showSearchResults && (
              <>
                <div 
                  className="fixed inset-0 z-[110]" 
                  onClick={() => setShowSearchResults(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  className="absolute top-12 left-0 right-0 bg-bg-base rounded-3xl shadow-2xl border border-border-subtle z-[120] overflow-hidden flex flex-col max-h-[500px]"
                >
                  <div className="flex-1 overflow-y-auto p-2">
                    {/* Posts Section */}
                    <div className="mb-4">
                      <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center justify-between">
                        <span>Posts</span>
                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{searchResults.posts.length}</span>
                      </div>
                      <div className="space-y-1">
                        {searchResults.posts.length > 0 ? (
                          searchResults.posts.map(post => (
                            <button
                              key={post._id}
                              onClick={() => {
                                navigate(`/watch/${post._id}`);
                                setShowSearchResults(false);
                                setSearchQuery('');
                              }}
                              className="w-full p-3 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-2xl transition-all text-left group"
                            >
                              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 relative">
                                <img src={post.fileUrl} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ArrowRight size={16} className="text-white" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm text-text-base truncate group-hover:text-brand-lime transition-colors">
                                  {post.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                                    post.fileType === 'video' 
                                      ? 'bg-brand-lime/10 text-brand-lime' 
                                      : 'bg-brand-pink/10 text-brand-pink'
                                  }`}>
                                    {post.fileType === 'video' ? <Video size={10} /> : <Camera size={10} />}
                                    {post.fileType === 'video' ? 'Video' : 'Photo'}
                                  </span>
                                  <span className="text-[10px] text-gray-400">@{post.creator?.username}</span>
                                </div>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-gray-400 italic">No posts found</div>
                        )}
                      </div>
                    </div>

                    {/* Users Section */}
                    <div>
                      <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center justify-between">
                        <span>Users</span>
                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{searchResults.users.length}</span>
                      </div>
                      <div className="space-y-1">
                        {searchResults.users.length > 0 ? (
                          searchResults.users.map(user => (
                            <button
                              key={user._id}
                              onClick={() => {
                                navigate(`/u/${user.username}`);
                                setShowSearchResults(false);
                                setSearchQuery('');
                              }}
                              className="w-full p-3 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-2xl transition-all text-left group"
                            >
                              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                                {user.profileImage ? (
                                  <img src={user.profileImage} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-brand-lime flex items-center justify-center font-bold text-black text-xs">
                                    {user.fullName[0].toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm text-text-base truncate group-hover:text-brand-lime transition-colors">
                                  {user.fullName}
                                </h4>
                                <p className="text-[10px] text-gray-400 font-bold">@{user.username}</p>
                              </div>
                              <ArrowRight size={14} className="text-gray-300 group-hover:text-brand-lime group-hover:translate-x-1 transition-all" />
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-gray-400 italic">No users found</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Results Summary Footer */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 border-t border-border-subtle text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Press Escape to close
                    </p>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <>
              <div className="relative">
                <button 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 relative transition-colors ${notificationsOpen ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                >
                  <Bell size={22} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-brand-pink text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-bg-base">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {notificationsOpen && (
                    <>
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setNotificationsOpen(false)}
                        className="fixed inset-0 z-[110]"
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 md:w-96 bg-bg-base rounded-3xl shadow-2xl border border-border-subtle z-[120] overflow-hidden flex flex-col max-h-[500px]"
                      >
                        <div className="p-5 border-b border-border-subtle flex items-center justify-between bg-bg-base sticky top-0">
                          <h3 className="font-bold text-lg">Notifications</h3>
                          <span className="text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full font-bold text-gray-500">
                            {unreadCount} New
                          </span>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                          {notifications.length > 0 ? (
                            <div className="divide-y divide-gray-50 dark:divide-gray-900">
                              {notifications.map((n) => (
                                <button
                                  key={n._id}
                                  onClick={() => {
                                    setNotificationsOpen(false);
                                    navigate(`/watch/${n.postId._id}`);
                                  }}
                                  className={`w-full p-4 flex gap-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left ${!n.isRead ? 'bg-brand-lime/5' : ''}`}
                                >
                                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                                    {n.senderUserId.profileImage ? (
                                      <img src={n.senderUserId.profileImage} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-brand-lime font-bold text-black">
                                        {n.senderUserId.username[0].toUpperCase()}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm leading-snug">
                                      <span className="font-bold text-text-base">@{n.senderUserId.username}</span>{' '}
                                      {n.type === 'like' ? 'liked your post' : 'commented on your post'}:{' '}
                                      <span className="font-medium text-deep-blue italic break-all underline underline-offset-2">"{n.postId.title}"</span>
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                      {n.type === 'like' ? <ThumbsUp size={10} /> : <MessageSquare size={10} />}
                                      <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                                      <span>•</span>
                                      <div className="flex items-center gap-1">
                                        <Clock size={10} />
                                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </div>
                                    </div>
                                  </div>
                                  {!n.isRead && (
                                    <div className="w-2 h-2 bg-brand-pink rounded-full self-center shrink-0" />
                                  )}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="p-12 text-center flex flex-col items-center">
                              <Bell size={40} className="text-gray-100 dark:text-gray-800 mb-4" />
                              <p className="text-gray-400 font-medium">No notifications yet.</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4 border-t border-border-subtle bg-gray-50 dark:bg-gray-900 text-center">
                          <button className="text-xs font-bold text-gray-500 hover:text-text-base transition-colors">
                              View Activity Log
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
              
              <Link to="/dashboard" className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 pr-4 rounded-full border border-border-subtle transition-colors">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-brand-lime flex items-center justify-center font-bold text-sm text-black">
                  {user.profileImage ? (
                    <img src={user.profileImage} className="w-full h-full object-cover" />
                  ) : (
                    user.fullName[0]
                  )}
                </div>
                <span className="text-sm font-bold hidden sm:block text-gray-600 dark:text-gray-400">{user.username}</span>
              </Link>
            </>
          ) : (
            <Link to="/login" className="btn-primary py-2 px-6">Login</Link>
          )}
        </div>
      </header>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-[110] backdrop-blur-sm"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-bg-base z-[120] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-border-subtle flex items-center justify-between">
                <Link to="/" className="text-2xl font-bold tracking-tighter flex items-center gap-2">
                  <div className="w-8 h-8 bg-brand-lime rounded-lg flex items-center justify-center">
                    <Zap size={20} className="text-black" />
                  </div>
                  Xpert Ads
                </Link>
                <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {navLinks.map((link) => (
                  <Link 
                    key={link.path}
                    to={link.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                      location.pathname === link.path 
                        ? 'bg-brand-lime text-black font-bold shadow-md shadow-brand-lime/10' 
                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="p-4 border-t border-border-subtle">
                <button 
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-text-base hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors font-medium mb-1"
                >
                  {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                  {theme === 'light' ? 'Dark' : 'Light'} Mode
                </button>

                {user ? (
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
                  >
                    <LogOut size={20} /> Logout
                  </button>
                ) : (
                  <Link to="/signup" className="btn-primary block text-center py-4">Get Started</Link>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Page Content */}
      <main className="flex-1 pt-16 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-bg-base border-t border-border-subtle py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <Link to="/" className="text-2xl font-bold tracking-tighter flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-brand-lime rounded-lg flex items-center justify-center">
                <Zap size={20} className="text-black" />
              </div>
              Xpert Ads
            </Link>
            <p className="text-gray-500 max-w-sm leading-relaxed">
              The premium destination for content creators to grow their reach through community-driven advertising and collaboration.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-text-base">Platform</h4>
            <ul className="space-y-4 text-gray-500 font-medium">
              <li><Link to="/communities" className="hover:text-text-base transition-colors">Communities</Link></li>
              <li><Link to="/upload" className="hover:text-text-base transition-colors">Start Advertising</Link></li>
              <li><Link to="/dashboard" className="hover:text-text-base transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-text-base">Company</h4>
            <ul className="space-y-4 text-gray-500 font-medium">
              <li><Link to="/about" className="hover:text-text-base transition-colors">About Us</Link></li>
              <li><Link to="/terms" className="hover:text-text-base transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-text-base transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-border-subtle mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Xpert Ads. All rights reserved.</p>
          <div className="flex gap-5">
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 bg-bg-input rounded-xl text-gray-400 hover:text-brand-lime hover:bg-brand-lime/10 transition-all hover:scale-110 active:scale-95"
              aria-label="Visit Twitter"
            >
              <Twitter size={20} />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 bg-bg-input rounded-xl text-gray-400 hover:text-brand-lime hover:bg-brand-lime/10 transition-all hover:scale-110 active:scale-95"
              aria-label="Visit Instagram"
            >
              <Instagram size={20} />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 bg-bg-input rounded-xl text-gray-400 hover:text-brand-lime hover:bg-brand-lime/10 transition-all hover:scale-110 active:scale-95"
              aria-label="Visit LinkedIn"
            >
              <Linkedin size={20} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

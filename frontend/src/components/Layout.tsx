import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Compass, Heart, MessageCircle, User, Trophy, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Layout() {
  const { logout, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/discover', icon: Compass, label: 'Discover' },
    { to: '/matches', icon: Heart, label: 'Matches' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/badges', icon: Trophy, label: 'Badges' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="bg-dark-800/80 backdrop-blur-lg border-b border-dark-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <NavLink to="/discover" className="flex items-center gap-2">
            <span className="text-2xl font-bold gradient-text font-mono">&lt;DevMatch /&gt;</span>
          </NavLink>

          <div className="flex items-center gap-4">
            {profile && (
              <span className="text-sm text-dark-400 hidden sm:block">
                Hey, {profile.display_name}
              </span>
            )}
            <button onClick={handleLogout} className="text-dark-400 hover:text-white transition-colors" title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>

      {/* Bottom navigation (mobile-first) */}
      <nav className="bg-dark-800/90 backdrop-blur-lg border-t border-dark-700 sticky bottom-0 z-50 sm:hidden">
        <div className="flex justify-around items-center h-16">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-xs transition-colors ${
                  isActive ? 'text-primary-400' : 'text-dark-500 hover:text-dark-300'
                }`
              }
            >
              <Icon size={22} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Side navigation (desktop) */}
      <nav className="hidden sm:flex fixed left-4 top-1/2 -translate-y-1/2 flex-col gap-2 z-50">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                  : 'bg-dark-800/80 text-dark-400 hover:bg-dark-700 hover:text-white backdrop-blur-lg'
              }`
            }
            title={label}
          >
            <Icon size={20} />
            <span className="text-sm font-medium hidden lg:block">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

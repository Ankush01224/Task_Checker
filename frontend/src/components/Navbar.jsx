import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <span className="text-[15px] font-semibold tracking-tight">Task Tracker</span>

        {user && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-ink-soft">
              {user.name}
              {user.role === 'admin' && (
                <span className="ml-2 rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-ink-soft">
                  admin
                </span>
              )}
            </span>
            <button
              onClick={handleLogout}
              className="text-ink-soft hover:text-ink transition-colors cursor-pointer"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

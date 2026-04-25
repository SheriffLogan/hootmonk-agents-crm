import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, LogOut, User, Settings } from 'lucide-react';
import { toggleMobileSidebar } from '../redux/layout/layoutSlice';
import { logoutRequest, selectUser } from '../redux/auth/authSlice';
import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

function ProfileDropdown({ user, onLogout, onProfile, onSettings }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center">
          <span className="text-xs font-bold text-white">
            {user?.firstName?.[0]?.toUpperCase() ?? 'U'}
          </span>
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold text-slate-800 leading-none">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-[10px] text-slate-500 capitalize">{user?.role}</p>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-card-lg border border-slate-200 py-1 z-50 animate-fade-in">
          <button onClick={onProfile}  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
            <User size={15} /> My Profile
          </button>
          <button onClick={onSettings} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
            <Settings size={15} /> Settings
          </button>
          <hr className="my-1 border-slate-100" />
          <button onClick={onLogout}   className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
            <LogOut size={15} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Topbar({ pageTitle }) {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const user      = useSelector(selectUser);

  const handleLogout = () => dispatch(logoutRequest({ navigate }));

  return (
    <header className="h-14 flex items-center gap-4 px-4 sm:px-6 bg-white border-b border-slate-200 sticky top-0 z-30">
      {/* Mobile hamburger */}
      <button
        onClick={() => dispatch(toggleMobileSidebar())}
        className="lg:hidden btn-ghost p-2"
      >
        <Menu size={18} />
      </button>

      {/* Page title */}
      <h1 className="text-sm font-semibold text-slate-800 flex-1 truncate">{pageTitle}</h1>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative btn-ghost p-2 rounded-lg">
          <Bell size={17} className="text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary-500 rounded-full" />
        </button>

        {/* Profile */}
        <ProfileDropdown
          user={user}
          onLogout={handleLogout}
          onProfile={() => navigate('/profile')}
          onSettings={() => navigate('/settings')}
        />
      </div>
    </header>
  );
}

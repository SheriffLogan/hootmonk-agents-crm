import { useSelector } from 'react-redux';
import { selectUser } from '../redux/auth/authSlice';
import { PageHeader } from '../components/common';
import { Mail, Shield, Calendar } from 'lucide-react';

export default function Profile() {
  const user = useSelector(selectUser);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <PageHeader title="My Profile" subtitle="Your account information and preferences" />

      <div className="card">
        <div className="card-body space-y-5">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
              {user?.firstName?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{user?.firstName} {user?.lastName}</h3>
              <span className="badge badge-blue capitalize">{user?.role ?? 'user'}</span>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail size={15} className="text-slate-400 flex-shrink-0" />
              <span className="text-slate-600">{user?.email ?? '—'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Shield size={15} className="text-slate-400 flex-shrink-0" />
              <span className="text-slate-600 capitalize">{user?.role ?? 'user'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

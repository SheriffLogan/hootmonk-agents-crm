import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50">
      <div className="text-center">
        <p className="text-8xl font-black text-slate-200 select-none">404</p>
        <h2 className="text-xl font-bold text-slate-800 mt-2 mb-1">Page not found</h2>
        <p className="text-sm text-slate-500 mb-6">The page you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">Go to dashboard</button>
      </div>
    </div>
  );
}

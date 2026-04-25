import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../helpers/api/apiCore';

const schema = z.object({ email: z.string().email('Enter a valid email') });

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (_) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <Mail size={20} className="text-emerald-600" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Check your inbox</h2>
        <p className="text-sm text-slate-500 mb-6">We sent a password reset link to your email address.</p>
        <Link to="/auth/login" className="btn-primary w-full block text-center py-2.5">Back to sign in</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/auth/login" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 mb-6">
        <ArrowLeft size={13} /> Back to sign in
      </Link>
      <h2 className="text-xl font-bold text-slate-900 mb-1">Forgot password?</h2>
      <p className="text-sm text-slate-500 mb-6">Enter your email and we'll send a reset link.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Email address</label>
          <input {...register('email')} type="email" placeholder="you@example.com" className={`input ${errors.email ? 'input-error' : ''}`} />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
    </div>
  );
}

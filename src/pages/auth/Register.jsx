import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import api from '../../helpers/api/apiCore';
import { ENDPOINTS } from '../../config/endpoints';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName:  z.string().min(1, 'Last name is required'),
  email:     z.string().email('Enter a valid email'),
  password:  z.string().min(8, 'Password must be at least 8 characters'),
});

export default function Register() {
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/auth/register', data);
      toast.success('Account created! Please sign in.');
      navigate('/auth/login');
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-1">Create account</h2>
      <p className="text-sm text-slate-500 mb-6">Join the Hootmonk CRM platform</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">First name</label>
            <input {...register('firstName')} placeholder="John" className={`input ${errors.firstName ? 'input-error' : ''}`} />
            {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="label">Last name</label>
            <input {...register('lastName')} placeholder="Doe" className={`input ${errors.lastName ? 'input-error' : ''}`} />
            {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
          </div>
        </div>

        <div>
          <label className="label">Email address</label>
          <input {...register('email')} type="email" placeholder="you@example.com" className={`input ${errors.email ? 'input-error' : ''}`} />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label className="label">Password</label>
          <input {...register('password')} type="password" placeholder="Min 8 characters" className={`input ${errors.password ? 'input-error' : ''}`} />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
}

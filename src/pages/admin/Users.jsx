import { useState, useEffect } from 'react';
import { DataTable, PageHeader, MetricCard } from '../../components/common';
import { Users, UserCheck, Shield } from 'lucide-react';
import api from '../../helpers/api/apiCore';
import { ENDPOINTS } from '../../config/endpoints';
import toast from 'react-hot-toast';

const COLUMNS = [
  { key: 'name',      header: 'Name',   render: (_, r) => `${r.firstName} ${r.lastName}` },
  { key: 'email',     header: 'Email'   },
  { key: 'role',      header: 'Role',   render: (v) => <span className="badge badge-blue capitalize">{v}</span> },
  {
    key: 'subscribedAgents',
    header: 'Agents',
    render: (v) => (
      <div className="flex gap-1 flex-wrap">
        {(v ?? []).length === 0
          ? <span className="text-slate-400 text-xs">None</span>
          : (v ?? []).map((a) => <span key={a} className="badge badge-green">{a}</span>)
        }
      </div>
    ),
  },
  { key: 'createdAt', header: 'Joined',  render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
];

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(ENDPOINTS.USERS.LIST)
      .then((r) => setUsers(r.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const admins = users.filter((u) => u.role === 'admin').length;
  const agents = users.filter((u) => u.subscribedAgents?.length > 0).length;

  return (
    <div className="p-6">
      <PageHeader title="User Management" subtitle="View and manage all CRM users" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard title="Total Users"     value={users.length} icon={<Users  size={18} />} loading={loading} />
        <MetricCard title="Admins"          value={admins}       icon={<Shield size={18} />} loading={loading} iconBg="bg-amber-50" iconColor="text-amber-600" />
        <MetricCard title="Active Agents"   value={agents}       icon={<UserCheck size={18}/>}loading={loading} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
      </div>

      <DataTable
        columns={COLUMNS}
        data={users}
        loading={loading}
        searchable
        searchKeys={['email', 'firstName', 'lastName']}
        rowKey="id"
      />
    </div>
  );
}

import { NavLink, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import * as Icons from 'lucide-react';
import { selectAgents, selectIsAdmin, selectUser } from '../redux/auth/authSlice';
import { selectSidebarCollapsed, toggleSidebar, closeMobileSidebar } from '../redux/layout/layoutSlice';
import { AGENT_CONFIGS, SHARED_SECTIONS, ADMIN_SECTIONS } from '../config/agents';
import clsx from 'clsx';

function NavIcon({ name, className }) {
  const Icon = Icons[name] ?? Icons.Circle;
  return <Icon className={className ?? 'w-[18px] h-[18px] flex-shrink-0'} />;
}

function SidebarSection({ title, items, collapsed }) {
  const location = useLocation();
  return (
    <div className="mb-2">
      {!collapsed && title && (
        <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-600 select-none">
          {title}
        </p>
      )}
      {items.map((item) => (
        <NavLink
          key={item.key}
          to={item.path}
          className={({ isActive }) =>
            clsx('sidebar-item', isActive && 'active')
          }
          title={collapsed ? item.label : undefined}
        >
          <NavIcon name={item.icon} />
          {!collapsed && <span className="truncate">{item.label}</span>}
        </NavLink>
      ))}
    </div>
  );
}

export default function Sidebar() {
  const dispatch   = useDispatch();
  const collapsed  = useSelector(selectSidebarCollapsed);
  const agents     = useSelector(selectAgents);
  const isAdmin    = useSelector(selectIsAdmin);
  const user       = useSelector(selectUser);

  // Build visible agent sections based on subscriptions
  const visibleAgentSections = Object.values(AGENT_CONFIGS).filter(
    (cfg) => isAdmin || agents.includes(cfg.id),
  );

  return (
    <aside
      className={clsx(
        'flex flex-col h-full bg-sidebar-bg text-sidebar-text transition-all duration-300',
        collapsed ? 'w-[60px]' : 'w-[240px]',
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 py-4 border-b border-slate-700/50">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
          <Icons.Bot className="w-4.5 h-4.5 text-white" size={18} />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold text-white leading-none">Hootmonk</p>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5">CRM Platform</p>
          </div>
        )}
      </div>

      {/* Nav content */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-3 space-y-0">
        {/* Shared sections */}
        <SidebarSection title="Main" items={SHARED_SECTIONS} collapsed={collapsed} />

        {/* Agent-specific sections */}
        {visibleAgentSections.map((cfg) => (
          <SidebarSection
            key={cfg.id}
            title={cfg.label}
            items={cfg.sections}
            collapsed={collapsed}
          />
        ))}

        {/* Admin sections */}
        {isAdmin && (
          <SidebarSection title="Admin" items={ADMIN_SECTIONS} collapsed={collapsed} />
        )}
      </nav>

      {/* User info + collapse toggle */}
      <div className="border-t border-slate-700/50 px-2 py-3 space-y-1">
        {!collapsed && user && (
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">
                {user.firstName?.[0]?.toUpperCase() ?? 'U'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[10px] text-slate-500 truncate capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="w-full sidebar-item justify-center"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <Icons.ChevronRight size={16} /> : <Icons.ChevronLeft size={16} />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

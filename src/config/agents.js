/**
 * Agent registry — single source of truth for all available agents.
 * Each agent entry drives: sidebar sections, route protection, subscription checks.
 */
export const AGENTS = {
  FINANCIAL_ADVISOR: 'financial-advisor',
  // Future agents:
  // MARKETING:   'marketing',
  // HR:          'hr',
  // LEGAL:       'legal',
};

export const AGENT_CONFIGS = {
  [AGENTS.FINANCIAL_ADVISOR]: {
    id:          AGENTS.FINANCIAL_ADVISOR,
    label:       'Financial Advisor',
    description: 'AI-powered personal finance management',
    icon:        'TrendingUp',   // Lucide icon name
    color:       '#6366f1',      // primary-500
    basePath:    '/financial-advisor',
    sections: [
      { key: 'fa-dashboard',    label: 'Overview',         icon: 'LayoutDashboard', path: '/financial-advisor/dashboard' },
      { key: 'fa-spending',     label: 'Spending',         icon: 'CreditCard',      path: '/financial-advisor/spending'  },
      { key: 'fa-savings',      label: 'Savings Goals',    icon: 'PiggyBank',       path: '/financial-advisor/savings'   },
      { key: 'fa-investments',  label: 'Investments',      icon: 'BarChart3',       path: '/financial-advisor/investments'},
      { key: 'fa-reports',      label: 'Reports',          icon: 'FileText',        path: '/financial-advisor/reports'   },
      { key: 'fa-ledger',       label: 'Ledger',           icon: 'HandCoins',       path: '/financial-advisor/ledger', description: 'Track lending, borrowing & fund allocations' },
    ],
  },
};

// Shared sections visible to all authenticated users
export const SHARED_SECTIONS = [
  { key: 'home',     label: 'Home',         icon: 'Home',     path: '/dashboard'  },
  { key: 'profile',  label: 'My Profile',   icon: 'User',     path: '/profile'    },
  { key: 'settings', label: 'Settings',     icon: 'Settings', path: '/settings'   },
];

// Admin-only sections
export const ADMIN_SECTIONS = [
  { key: 'admin-users',       label: 'User Management',        icon: 'Users',          path: '/admin/users'       },
  { key: 'admin-subscriptions',label: 'Subscriptions',         icon: 'ShoppingCart',   path: '/admin/subscriptions'},
  { key: 'admin-agents',      label: 'Agent Config',           icon: 'Bot',            path: '/admin/agents'      },
];

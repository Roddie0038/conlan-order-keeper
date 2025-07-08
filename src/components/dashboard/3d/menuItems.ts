export interface MenuItem3D {
  id: string;
  title: string;
  path: string;
  icon: string;
  color: string;
  description: string;
}

export const menuItems3D: MenuItem3D[] = [
  {
    id: 'new-order',
    title: 'NEW ORDER',
    path: '/pending-orders',
    icon: '📝',
    color: '#fbbf24',
    description: 'Create new tire orders'
  },
  {
    id: 'mto',
    title: 'MTO',
    path: '/mto-order',
    icon: '🔄',
    color: '#60a5fa',
    description: 'Make-to-order requests'
  },
  {
    id: 'order-mgmt',
    title: 'ORDER MANAGEMENT',
    path: '/order-management',
    icon: '📋',
    color: '#f59e0b',
    description: 'Manage existing orders'
  },
  {
    id: 'cross-dock',
    title: 'CROSS DOCK',
    path: '/cross-dock',
    icon: '🚛',
    color: '#22c55e',
    description: 'Cross-docking operations'
  },
  {
    id: 'wheel-refurb',
    title: 'WHEEL REFURB',
    path: '/wheel-order',
    icon: '🔧',
    color: '#2F9599',
    description: 'Wheel refurbishment orders'
  },
  {
    id: 'warranty',
    title: 'WARRANTY',
    path: '/retread-warranty',
    icon: '🛡️',
    color: '#ef4444',
    description: 'Retread warranty claims'
  },
  {
    id: 'complaints',
    title: 'COMPLAINTS',
    path: '/complaint-tracking',
    icon: '📢',
    color: '#f97316',
    description: 'Customer complaint tracking'
  },
  {
    id: 'approved-treads',
    title: 'APPROVED TREADS',
    path: '/approved-treads',
    icon: '✅',
    color: '#8b5cf6',
    description: 'View approved tread patterns'
  }
];

// Orbital animation configuration
export const orbitConfig = {
  radius: 4,
  height: 0.5,
  speed: 0.5,
  itemScale: 0.8,
  hoverScale: 1.1
};
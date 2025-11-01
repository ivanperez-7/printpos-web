import { HeartHandshake, Package2, Settings, TrendingUpDown, User } from 'lucide-react';

type NavItem = {
  route:
    | '.'
    | '..'
    | '/'
    | '/login'
    | '/clients'
    | '/dashboard'
    | '/profile'
    | '/settings'
    | '/catalogo/$id'
    | '/catalogo'
    | undefined;
  title: string;
  Icon?: React.ComponentType;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navigation: NavSection[] = [
  {
    title: 'Inventario',
    items: [
      {
        route: '/catalogo',
        title: 'Nuestros productos',
        Icon: Package2,
      },
      {
        route: '/profile',
        title: 'Check my profile',
        Icon: User,
      },
    ],
  },
  {
    title: 'Configuraciones',
    items: [
      {
        route: '/clients',
        title: 'Query clients',
        Icon: HeartHandshake,
      },
      {
        route: '/settings',
        title: 'My settings',
        Icon: Settings,
      },
      {
        route: '/dashboard',
        title: 'Dashboard',
        Icon: TrendingUpDown,
      },
    ],
  },
];

export default navigation;

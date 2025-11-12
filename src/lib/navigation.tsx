import { ArrowLeftRight, BookUser, Package2, TrendingUpDown } from 'lucide-react';

type NavItem = {
  route:
    | '.'
    | '..'
    | '/'
    | '/login'
    | '/movements'
    | '/dashboard'
    | '/suppliers'
    | '/profile'
    | '/settings'
    | '/catalogo/$id'
    | '/catalogo'
    | undefined;
  title: string;
  Icon?: React.ReactNode;
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
        title: 'Productos',
        Icon: <Package2 />,
      },
      {
        route: '/suppliers',
        title: 'Proveedores',
        Icon: <BookUser />,
      },
    ],
  },
  {
    title: 'Movimientos',
    items: [
      {
        route: '/movements',
        title: 'Registrar movimiento',
        Icon: <ArrowLeftRight />,
      },
      {
        route: '/dashboard',
        title: 'Dashboard',
        Icon: <TrendingUpDown />,
      },
    ],
  },
];

export default navigation;

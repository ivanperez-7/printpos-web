import type { Link, LinkComponentProps } from '@tanstack/react-router';
import {
  ArrowLeftRight,
  BookUser,
  LayoutDashboard,
  Package2,
  Printer,
  Sparkles,
  TruckIcon
} from 'lucide-react';

type NavItem = LinkComponentProps<typeof Link> & {
  content: string;
  icon?: React.ReactNode;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navigation: NavSection[] = [
  {
    title: '',
    items: [
      {
        to: '/dashboard',
        content: 'Dashboard',
        icon: <LayoutDashboard />,
      },
      {
        to: '/chatbot',
        content: 'Asistente IA',
        icon: <Sparkles />,
      },
    ],
  },
  {
    title: 'Catálogos',
    items: [
      {
        to: '/catalogo',
        content: 'Productos',
        icon: <Package2 />,
      },
      {
        to: '/equipos',
        content: 'Equipos',
        icon: <Printer />,
      },
      {
        to: '/clients',
        content: 'Clientes',
        icon: <BookUser />,
      },
      {
        to: '/suppliers',
        content: 'Proveedores',
        icon: <TruckIcon />,
      },
    ],
  },
  {
    title: 'Movimientos',
    items: [
      {
        to: '/movements',
        content: 'Ver movimientos',
        icon: <ArrowLeftRight />,
      },
    ],
  },
];

export default navigation;

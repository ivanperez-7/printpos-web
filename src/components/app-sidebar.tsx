import * as React from 'react';

import { VersionSwitcher } from '@/components/version-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { CustomLink } from './custom-link';
import { NavFooter } from './nav-footer';

const data = [
  {
    title: 'Inventario',
    items: [
      {
        route: '/catalogo',
        title: 'Nuestros productos',
      },
      {
        route: '/profile',
        title: 'Check my profile',
      },
    ],
  },
  {
    title: 'Configuraciones',
    items: [
      {
        route: '/clients',
        title: 'Query clients',
      },
      {
        route: '/settings',
        title: 'My settings',
      },
      {
        route: '/dashboard',
        title: 'Dashboard',
      },
    ],
  },
];

export function AppSidebar({
  onLogOut,
  ...props
}: { onLogOut: React.MouseEventHandler<HTMLDivElement> } & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {data.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <CustomLink to={item.route} content={item.title} />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavFooter user={{ name: 'hm', email: 'hm' }} onLogOut={onLogOut} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

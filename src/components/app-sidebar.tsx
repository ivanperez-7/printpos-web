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
  useSidebar,
} from '@/components/ui/sidebar';
import { PackageOpen, Settings } from 'lucide-react';
import * as React from 'react';
import { CustomSidebarLink } from './custom-link';
import { NavFooter } from './nav-footer';

import navigation from '@/lib/navigation';

export function AppSidebar({
  onLogout,
  loadingLogout,
  ...props
}: {
  onLogout: React.MouseEventHandler<HTMLDivElement>;
  loadingLogout: boolean;
} & React.ComponentProps<typeof Sidebar>) {
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className='flex gap-2 mx-2 mt-2 items-center'>
          <div className='bg-blue-700 text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
            <PackageOpen className='size-4' />
          </div>
          <div className='flex flex-col gap-1 leading-none text-sm'>
            <span className='font-medium'>Manejador de inventario</span>
            <span className='text-muted-foreground'>Printcopy</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navigation.map((section) => (
          <SidebarGroup key={section.title}>
            {section.title && <SidebarGroupLabel>{section.title}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.content}>
                    <CustomSidebarLink
                      to={item.to}
                      content={item.content}
                      icon={item.icon}
                      onClick={() => setOpenMobile(false)}
                    />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuItem>
          <CustomSidebarLink
            to='/settings'
            content='Configuración'
            icon={<Settings />}
            onClick={() => setOpenMobile(false)}
          />
        </SidebarMenuItem>
        <NavFooter
          user={{
            name: localStorage.getItem('username') || 'N/A',
            email: localStorage.getItem('email') || 'N/A',
            avatar: localStorage.getItem('avatar') ?? undefined,
          }}
          onLogout={onLogout}
          loadingLogout={loadingLogout}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

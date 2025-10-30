import * as React from 'react';

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
import navigation from '@/lib/navigation';
import { GalleryVerticalEnd } from 'lucide-react';
import { CustomSidebarLink } from './custom-link';
import { NavFooter } from './nav-footer';

export function AppSidebar({
  onLogout,
  ...props
}: { onLogout: React.MouseEventHandler<HTMLDivElement> } & React.ComponentProps<typeof Sidebar>) {
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className='flex gap-2 m-2 items-center'>
          <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
            <GalleryVerticalEnd className='size-4' />
          </div>
          <div className='flex flex-col gap-1 leading-none text-sm'>
            <span className='font-medium'>Manejador de inventario</span>
            <span className=''>Printcopy</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navigation.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <CustomSidebarLink
                      to={item.route}
                      content={item.title}
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
        <NavFooter user={{ name: 'hm', email: 'hm' }} onLogout={onLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

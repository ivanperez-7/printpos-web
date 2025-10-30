import { createLink } from '@tanstack/react-router';
import type { LinkComponent } from '@tanstack/react-router';
import { SidebarMenuButton } from './ui/sidebar';
import { Button } from './ui/button';

export const TanStackLinkComponent = createLink(SidebarMenuButton);
export const CustomLink = createLink(Button);

export const CustomSidebarLink: LinkComponent<typeof TanStackLinkComponent> = (props) => (
  <TanStackLinkComponent activeProps={{ isActive: true }} {...props}>
    {props.content}
  </TanStackLinkComponent>
);

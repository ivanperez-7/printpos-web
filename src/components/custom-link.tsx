import { createLink } from '@tanstack/react-router';
import type { LinkComponent } from '@tanstack/react-router';
import { SidebarMenuButton } from './ui/sidebar';

export const TanStackLinkComponent = createLink(SidebarMenuButton);

export const CustomLink: LinkComponent<typeof TanStackLinkComponent> = (props) => (
  <TanStackLinkComponent activeProps={{ isActive: true }} {...props}>
    {props.content}
  </TanStackLinkComponent>
);

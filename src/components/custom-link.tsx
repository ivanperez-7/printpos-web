import { createLink } from '@tanstack/react-router';
import type { LinkComponentProps } from '@tanstack/react-router';
import { SidebarMenuButton } from './ui/sidebar';
import { Button } from './ui/button';

export const TanStackLinkComponent = createLink(SidebarMenuButton);
export const CustomLink = createLink(Button);

type CustomSidebarLinkProps = LinkComponentProps<typeof TanStackLinkComponent> & {
  Icon?: React.ComponentType<{ className?: string }>;
  content?: string;
  onClick?: () => void;
};

export const CustomSidebarLink: React.FC<CustomSidebarLinkProps> = ({ Icon, content, ...props }) => (
  <TanStackLinkComponent activeProps={{ isActive: true }} {...props}>
    {Icon && <Icon  />}
    {content}
  </TanStackLinkComponent>
);

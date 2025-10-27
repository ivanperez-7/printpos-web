import { createLink } from '@tanstack/react-router';
import type { LinkComponent } from '@tanstack/react-router';
import { Button } from './ui/button';

const MyNavButton = (props: React.ComponentProps<'button'>) => (
  <Button variant='outline' className='hover:bg-gray-100 dark:hover:bg-gray-800' {...props} />
);

export const TanStackLinkComponent = createLink(MyNavButton);

export const CustomLink: LinkComponent<typeof TanStackLinkComponent> = (props) => (
  <TanStackLinkComponent
    activeProps={{ className: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-900' }}
    {...props}
  >
    {props.content}
  </TanStackLinkComponent>
);

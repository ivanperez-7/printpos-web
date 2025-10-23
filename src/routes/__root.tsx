import { Button } from '@/components/ui/button';
import { Link, Outlet, createRootRoute } from '@tanstack/react-router';

const navbarPages = [
  {
    route: '/',
    text: 'Home',
  },
  {
    route: '/catalogo',
    text: 'Nuestros productos',
  },
  {
    route: '/profile',
    text: 'Check my profile',
  },
  {
    route: '/login',
    text: 'Login',
  },
];

export const Route = createRootRoute({
  component: () => (
    <>
      <h1 className='text-3xl'>Printcopy tienda web</h1>
      <ul>
        {navbarPages.map((page, index) => (
          <li key={index}>
            <Link to={page.route}>
              <Button variant='outline'>{page.text}</Button>
            </Link>
          </li>
        ))}
        <li>
          <Link
            to='/profile'
            search={{
              name: 'damn',
              is_active: true,
              categories: ['S', 'G'],
            }}
          >
            <Button variant='outline'>Check my profile with params</Button>
          </Link>
        </li>
      </ul>
      <Outlet />
    </>
  ),
});

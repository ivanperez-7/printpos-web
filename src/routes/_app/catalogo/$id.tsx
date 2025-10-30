import { fetchProductoById } from '@/api/catalogo';
import { CustomLink } from '@/components/custom-link';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/catalogo/$id')({
  component: RouteComponent,
  loader: async ({ params }) => await fetchProductoById(Number(params.id)),
});

function RouteComponent() {
  const producto = Route.useLoaderData();

  return (
    <div>
      <CustomLink to='/catalogo' className='mb-5'>Go back pls</CustomLink>
      <pre>{JSON.stringify(producto, null, 4)}</pre>
    </div>
  );
}

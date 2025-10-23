import { fetchProductoById } from '@/api/catalogo';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/catalogo/$id')({
  component: RouteComponent,
  loader: async ({ params }) => await fetchProductoById(Number(params.id)),
});

function RouteComponent() {
  const { id } = Route.useParams();
  const producto = Route.useLoaderData();

  console.log(producto);

  return (
    <div>
      Hello "/catalogo/$id"! {id} <p>{producto.codigo}</p>
    </div>
  );
}

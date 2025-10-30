import { fetchAllProductos } from '@/api/catalogo';
import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/catalogo/')({
  component: RouteComponent,
  loader: fetchAllProductos,
});

function RouteComponent() {
  const productos = Route.useLoaderData();

  return (
    <div>
      <h1 className='text-2xl'>Nuestros productos</h1>
      <ul>
        {productos.map((prod) => (
          <Link to='/catalogo/$id' params={{ id: String(prod.id) }}>
            {prod.codigo}
          </Link>
        ))}
      </ul>
    </div>
  );
}

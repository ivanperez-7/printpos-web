import { authGuard } from '@/lib/auth';
import { createFileRoute } from '@tanstack/react-router';

type SearchFilters = {
  name: string;
};

export const Route = createFileRoute('/profile')({
  validateSearch: (search: Record<string, unknown>): SearchFilters => ({
    name: search.name as string,
  }),
  beforeLoad: authGuard,
  component: RouteComponent,
});

function RouteComponent() {
  const { name, is_active, categories } = Route.useSearch();

  return (
    <div>
      Hello "/profile"! <div>{JSON.stringify({ name, is_active, categories })}</div>
    </div>
  );
}

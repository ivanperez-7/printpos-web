import { authGuard } from '@/lib/auth';
import { createFileRoute } from '@tanstack/react-router';

type SearchFilters = {
  name?: string;
  is_active?: boolean;
  categories?: string[];
};

export const Route = createFileRoute('/profile')({
  validateSearch: (search: Record<string, unknown>): SearchFilters => ({
    name: search?.name as string,
    is_active: search?.is_active as boolean,
    categories: search?.categories as string[],
  }),
  beforeLoad: async () => await authGuard(),
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

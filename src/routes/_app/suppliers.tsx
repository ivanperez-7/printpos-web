import { createFileRoute, ErrorComponent } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/suppliers')({
  component: SuppliersPage,
  errorComponent: ({ error }) => <ErrorComponent error={error} />,
});

function SuppliersPage() {
  return <div>Hello "/_app/suppliers"!</div>;
}

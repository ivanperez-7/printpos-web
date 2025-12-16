import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/suppliers')({
  component: SuppliersPage,
})

function SuppliersPage() {
  return <div>Hello "/_app/suppliers"!</div>
}

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private/clients')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_private/clients"!</div>
}

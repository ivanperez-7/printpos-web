import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/chatbot')({
  component: ChatbotPage,
})

function ChatbotPage() {
  return <div>Hello "/_app/chatbot"!</div>
}

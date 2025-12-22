import { createFileRoute, ErrorComponent } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/chatbot')({
  component: ChatbotPage,
  errorComponent: ({ error }) => <ErrorComponent error={error} />,
});

function ChatbotPage() {
  return <div>Hello "/_app/chatbot"!</div>;
}

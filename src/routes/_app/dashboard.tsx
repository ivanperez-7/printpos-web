import { SectionCards } from '@/components/section-cards';
import { useHeader } from '@/components/site-header';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/_app/dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  const { setContent } = useHeader();

  useEffect(() => {
    setContent('Dashboard');
    return () => setContent(null);
  }, []);

  return (
    <div className='flex flex-1 flex-col'>
      <h1 className='font-bold text-3xl mb-5'>Resumen de movimientos</h1>
      <div className='@container/main'>
        <SectionCards />
      </div>
    </div>
  );
}

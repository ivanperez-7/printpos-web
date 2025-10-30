import { GalleryVerticalEnd } from 'lucide-react';

export function VersionSwitcher() {
  return (
    <div className='flex gap-2 m-2 items-center'>
      <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
        <GalleryVerticalEnd className='size-4' />
      </div>
      <div className='flex flex-col gap-1 leading-none text-sm'>
        <span className='font-medium'>Manejador de inventario</span>
        <span className=''>Printcopy</span>
      </div>
    </div>
  );
}

import { Bell, Check, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from '@/components/ui/item';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function NotificationPopup() {
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Nueva tarea', description: 'Tienes una tarea pendiente', read: false },
    { id: 2, title: 'Actualización', description: 'Se actualizó tu reporte', read: true },
    { id: 3, title: 'Recordatorio', description: 'Tu cita es mañana', read: false },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon' className='relative'>
          <Bell />
          {unreadCount > 0 && (
            <span className='absolute top-1 right-1 w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full' />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className='w-80 p-0'>
        <ItemGroup>
          {notifications.length === 0 && (
            <div className='text-center py-6 text-sm text-muted-foreground'>
              No tienes notificaciones
            </div>
          )}

          {notifications.map((n, index) => (
            <div key={n.id}>
              <Item variant={n.read ? 'muted' : 'default'} size='sm'>
                <ItemMedia variant='icon'>
                  <Bell className='size-4' />
                </ItemMedia>

                <ItemContent>
                  <ItemTitle>{n.title}</ItemTitle>
                  <ItemDescription>{n.description}</ItemDescription>
                </ItemContent>

                <ItemActions>
                  {!n.read && (
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(n.id);
                      }}
                    >
                      <Check className='size-4' />
                    </Button>
                  )}

                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(n.id);
                    }}
                  >
                    <X className='size-4 text-muted-foreground hover:text-red-500' />
                  </Button>
                </ItemActions>
              </Item>

              {index < notifications.length - 1 && <ItemSeparator />}
            </div>
          ))}
        </ItemGroup>
      </PopoverContent>
    </Popover>
  );
}

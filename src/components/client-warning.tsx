import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export const ClientWarning = () => (
  <Tooltip>
    <TooltipTrigger>
      <Badge
        className='ml-1.5'
        variant='destructive'
        onClick={(e) => {
          e.preventDefault();
        }}
      >
        !
      </Badge>
    </TooltipTrigger>
    <TooltipContent>El cliente no tiene información de este equipo</TooltipContent>
  </Tooltip>
);

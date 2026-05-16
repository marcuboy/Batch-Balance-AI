import { Box, Typography } from '@mui/material';
import {
  Category,
  Cable,
  Inventory2,
  PrecisionManufacturing,
  Widgets,
} from '@mui/icons-material';
import type { Part } from '../types';

interface PartThumbnailProps {
  part: Part;
  size?: number;
  showLabel?: boolean;
}

const getPartMeta = (partNumber: string) => {
  const prefix = partNumber.split('-')[0];
  switch (prefix) {
    case 'WIR':
    case 'HRN':
      return { label: 'Harness', icon: <Cable fontSize="small" />, colors: ['#0284C7', '#06B6D4'] };
    case 'GSK':
      return { label: 'Gasket', icon: <Widgets fontSize="small" />, colors: ['#0F766E', '#14B8A6'] };
    case 'CST':
      return { label: 'Casting', icon: <PrecisionManufacturing fontSize="small" />, colors: ['#7C3AED', '#A78BFA'] };
    case 'BFS':
    case 'BRK':
    case 'CLM':
      return { label: 'Hardware', icon: <Category fontSize="small" />, colors: ['#DC2626', '#F97316'] };
    default:
      return { label: 'Part', icon: <Inventory2 fontSize="small" />, colors: ['#007A72', '#3157D5'] };
  }
};

export default function PartThumbnail({ part, size = 44, showLabel = false }: PartThumbnailProps) {
  const meta = getPartMeta(part.part);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: 2,
          overflow: 'hidden',
          flex: `0 0 ${size}px`,
          position: 'relative',
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'background.default',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? 'inset 0 1px 0 rgba(255,255,255,0.08)'
              : 'inset 0 1px 0 rgba(255,255,255,0.9)',
        }}
      >
        {part.imageUrl ? (
          <Box
            component="img"
            src={part.imageUrl}
            alt={`${part.part} product`}
            loading="lazy"
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'grid',
              placeItems: 'center',
              color: 'white',
              background: `linear-gradient(135deg, ${meta.colors[0]}, ${meta.colors[1]})`,
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: '48% -20% -35% -20%',
                background: 'rgba(255,255,255,0.20)',
                transform: 'rotate(-18deg)',
              },
              '& svg': {
                position: 'relative',
                zIndex: 1,
              },
            }}
          >
            {meta.icon}
          </Box>
        )}
      </Box>
      {showLabel && (
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.86rem', lineHeight: 1.2 }} noWrap>
            {part.part}
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: '0.72rem' }} noWrap>
            {meta.label}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

// Made with Bob

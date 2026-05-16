import type { Part } from '../types';
import RiskBadge from '../components/RiskBadge';
import FlagBadge from '../components/FlagBadge';
import { fmt, fmtGBP, fmtVol } from './formatters';

// Helper function to create common column renderers
export const columnRenderers = {
  risk: (part: Part) => <RiskBadge risk={part.risk} type="overstock" />,
  shortageRisk: (part: Part) => <RiskBadge risk={part.shortageRisk} type="shortage" />,
  flags: (part: Part) => (
    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
      {part.atb && <FlagBadge type="atb" />}
      {part.obs && <FlagBadge type="obsolete" />}
      {part.isTLS && <FlagBadge type="tls" />}
      <FlagBadge type={part.site === 'WBN' ? 'site-wbn' : 'site-sta'} />
    </div>
  ),
  number: (value: number) => fmt(value),
  gbp: (value: number) => fmtGBP(value),
  volume: (value: number) => fmtVol(value),
};

// Made with Bob

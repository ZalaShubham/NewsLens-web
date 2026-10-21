import React from 'react';
import { EyeOff } from 'lucide-react';

export default function BlindspotBadge({ blindspot }) {
  if (!blindspot) return null;

  const isRight = blindspot === 'right';
  const label = isRight ? 'Right Blindspot' : 'Left Blindspot';

  return (
    <span className={`blindspot-badge ${blindspot}`} title={`Under-reported by ${blindspot} media outlets`}>
      <EyeOff size={12} />
      {label}
    </span>
  );
}

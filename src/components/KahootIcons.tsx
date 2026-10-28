import React from 'react';
import { ShapeType } from '../types/quiz';

interface IconProps {
  className?: string;
}

export function TriangleIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 3L2 21H22L12 3Z" />
    </svg>
  );
}

export function DiamondIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2L2 12L12 22L22 12L12 2Z" />
    </svg>
  );
}

export function CircleIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export function SquareIcon({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  );
}

export function ShapeIcon({ shape, className = 'w-6 h-6' }: { shape: ShapeType; className?: string }) {
  switch (shape) {
    case 'triangle':
      return <TriangleIcon className={className} />;
    case 'diamond':
      return <DiamondIcon className={className} />;
    case 'circle':
      return <CircleIcon className={className} />;
    case 'square':
      return <SquareIcon className={className} />;
  }
}

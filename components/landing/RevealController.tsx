'use client';

import { useReveal } from '@/lib/useReveal';

/**
 * Mounts the IntersectionObserver that adds .is-visible to .reveal elements.
 * Renders nothing — pure side effect component.
 */
export default function RevealController() {
  useReveal();
  return null;
}

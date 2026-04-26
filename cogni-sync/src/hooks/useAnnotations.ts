import { useState } from 'react';
import type { Annotation } from '../types';

export const HIGHLIGHT_PALETTE = ['#fde68a', '#a7f3d0', '#bfdbfe'];

// Add an annotation to the list
export function addAnnotation(annotations: Annotation[], annotation: Annotation): Annotation[] {
  return [...annotations, annotation];
}

// Delete an annotation by id
export function deleteAnnotation(annotations: Annotation[], id: string): Annotation[] {
  return annotations.filter(a => a.id !== id);
}

// Get annotations for a specific sessionId
export function getAnnotations(annotations: Annotation[], sessionId: string): Annotation[] {
  return annotations.filter(a => a.sessionId === sessionId);
}

export function useAnnotations(sessionId: string) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  return {
    annotations: getAnnotations(annotations, sessionId),
    addAnnotation: (annotation: Annotation) => setAnnotations(prev => addAnnotation(prev, annotation)),
    deleteAnnotation: (id: string) => setAnnotations(prev => deleteAnnotation(prev, id)),
    getAnnotations: (sid: string) => getAnnotations(annotations, sid),
  };
}

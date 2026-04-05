/**
 * Grade Calculation
 *
 * Maps a numeric score (0–100) to a letter grade and human-readable label.
 */
import type { Grade } from './types.js';

interface GradeInfo {
  grade: Grade;
  label: string;
}

const GRADE_THRESHOLDS: Array<{ min: number; grade: Grade; label: string }> = [
  { min: 95, grade: 'A+', label: 'Excellent' },
  { min: 90, grade: 'A', label: 'Very Good' },
  { min: 80, grade: 'B', label: 'Good' },
  { min: 70, grade: 'C', label: 'Acceptable' },
  { min: 50, grade: 'D', label: 'Poor' },
  { min: 0, grade: 'F', label: 'Failing' }
];

/**
 * Convert a numeric score (0–100) to a letter grade and label.
 */
export function getGrade(score: number): GradeInfo {
  const clamped = Math.max(0, Math.min(100, score));
  for (const threshold of GRADE_THRESHOLDS) {
    if (clamped >= threshold.min) {
      return { grade: threshold.grade, label: threshold.label };
    }
  }
  // Should never reach here
  return { grade: 'F', label: 'Failing' };
}

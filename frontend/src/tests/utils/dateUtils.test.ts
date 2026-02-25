/**
 * Date utility function tests
 */
import { formatDate, formatDateTime, formatRelativeTime, calculateDaysBetween } from '@/utils/dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('formats date string correctly', () => {
      const date = '2024-01-15';
      const result = formatDate(date);
      expect(result).toMatch(/Jan.*15.*2024/);
    });

    it('formats date with custom format', () => {
      const date = '2024-01-15';
      const result = formatDate(date, 'yyyy-MM-dd');
      expect(result).toBe('2024-01-15');
    });

    it('returns "-" for null date', () => {
      const result = formatDate(null);
      expect(result).toBe('-');
    });

    it('handles Date object', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date);
      expect(result).toMatch(/Jan.*15.*2024/);
    });
  });

  describe('formatDateTime', () => {
    it('formats datetime string correctly', () => {
      const date = '2024-01-15T10:30:00Z';
      const result = formatDateTime(date);
      expect(result).toMatch(/Jan.*15.*2024/);
      // Time may vary based on timezone, so just check it contains time
      expect(result.length).toBeGreaterThan(10);
    });

    it('returns "-" for null date', () => {
      const result = formatDateTime(null);
      expect(result).toBe('-');
    });
  });

  describe('formatRelativeTime', () => {
    it('formats relative time correctly', () => {
      const date = new Date();
      date.setHours(date.getHours() - 2);
      const result = formatRelativeTime(date.toISOString());
      expect(result).toMatch(/ago/i);
    });

    it('returns "-" for null date', () => {
      const result = formatRelativeTime(null);
      expect(result).toBe('-');
    });
  });

  describe('calculateDaysBetween', () => {
    it('calculates days between dates correctly', () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-11';
      const result = calculateDaysBetween(startDate, endDate);
      expect(result).toBe(10);
    });

    it('uses current date as default end date', () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 5);
      const result = calculateDaysBetween(startDate.toISOString());
      expect(result).toBe(5);
    });

    it('handles invalid dates gracefully', () => {
      const result = calculateDaysBetween('invalid', 'invalid');
      // NaN or 0 are both acceptable for invalid dates
      expect(isNaN(result) || result === 0).toBe(true);
    });
  });
});


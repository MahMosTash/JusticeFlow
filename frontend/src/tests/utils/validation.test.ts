/**
 * Validation utility function tests
 */
import {
  validateEmail,
  validatePhoneNumber,
  validateNationalID,
  validateFileSize,
  validateFileType,
} from '@/utils/validation';

describe('validation', () => {
  describe('validateEmail', () => {
    it('validates correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('user@domain')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePhoneNumber', () => {
    it('validates correct phone numbers', () => {
      expect(validatePhoneNumber('1234567890')).toBe(true);
      expect(validatePhoneNumber('+1234567890')).toBe(true);
      expect(validatePhoneNumber('(123) 456-7890')).toBe(true);
      expect(validatePhoneNumber('123-456-7890')).toBe(true);
    });

    it('rejects invalid phone numbers', () => {
      expect(validatePhoneNumber('123')).toBe(false);
      expect(validatePhoneNumber('abc123')).toBe(false);
      expect(validatePhoneNumber('')).toBe(false);
    });
  });

  describe('validateNationalID', () => {
    it('validates correct national IDs', () => {
      expect(validateNationalID('12345678')).toBe(true);
      expect(validateNationalID('123456789012')).toBe(true);
      expect(validateNationalID('123456789')).toBe(true);
    });

    it('rejects invalid national IDs', () => {
      expect(validateNationalID('12345')).toBe(false);
      expect(validateNationalID('abc123456')).toBe(false);
      expect(validateNationalID('1234567890123')).toBe(false);
      expect(validateNationalID('')).toBe(false);
    });
  });

  describe('validateFileSize', () => {
    it('validates file size correctly', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
      
      expect(validateFileSize(file, 5 * 1024 * 1024)).toBe(true);
      expect(validateFileSize(file, 1024 * 1024)).toBe(true);
    });

    it('rejects files exceeding max size', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 }); // 10MB
      
      expect(validateFileSize(file, 5 * 1024 * 1024)).toBe(false);
    });
  });

  describe('validateFileType', () => {
    it('validates file type correctly', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const allowedTypes = ['image/jpeg', 'image/png'];
      
      expect(validateFileType(file, allowedTypes)).toBe(true);
    });

    it('rejects files with disallowed types', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const allowedTypes = ['image/jpeg', 'image/png'];
      
      expect(validateFileType(file, allowedTypes)).toBe(false);
    });
  });
});


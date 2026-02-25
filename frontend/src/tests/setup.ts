import '@testing-library/jest-dom'

// Mock import.meta for Jest
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {},
    },
  },
  writable: true,
});


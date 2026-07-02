import { vi } from 'vitest';

const storage = new Map<string, string>();

vi.stubGlobal('localStorage', {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
  removeItem: (key: string) => {
    storage.delete(key);
  },
  clear: () => {
    storage.clear();
  },
});

const classList = new Set<string>();

vi.stubGlobal('document', {
  documentElement: {
    classList: {
      contains: (name: string) => classList.has(name),
      add: (name: string) => {
        classList.add(name);
      },
      remove: (name: string) => {
        classList.delete(name);
      },
      toggle: (name: string, force?: boolean) => {
        const next = force ?? !classList.has(name);
        if (next) {
          classList.add(name);
        } else {
          classList.delete(name);
        }
        return next;
      },
    },
    style: {
      colorScheme: '',
    },
    offsetHeight: 0,
  },
});

vi.stubGlobal(
  'matchMedia',
  vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
);

beforeEach(() => {
  storage.clear();
  classList.clear();
  document.documentElement.style.colorScheme = '';
});

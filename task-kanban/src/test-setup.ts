import '@testing-library/jest-dom'

const jsdomStorage = (globalThis as typeof globalThis & {
  jsdom: { window: Window }
}).jsdom.window.localStorage

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  enumerable: true,
  value: jsdomStorage,
})

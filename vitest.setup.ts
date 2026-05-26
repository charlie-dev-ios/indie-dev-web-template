import "@testing-library/jest-dom";

// jsdom には ResizeObserver が実装されていないため、
// 利用するライブラリ向けに最小限のスタブを用意する。
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

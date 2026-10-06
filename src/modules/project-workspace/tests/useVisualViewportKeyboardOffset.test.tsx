// The keyboard offset lifts the fixed workspace shell above the virtual keyboard. A visual viewport
// that is smaller than the window for any other reason (browser toolbar, rubber-band scroll, pinch)
// must not be mistaken for a keyboard, or the shell keeps a blank band under it until reload.
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { useVisualViewportKeyboardOffset } from '@/modules/project-workspace/hooks/useVisualViewportKeyboardOffset';

function Probe() {
  useVisualViewportKeyboardOffset();
  return <textarea data-testid="field" />;
}

describe('useVisualViewportKeyboardOffset', () => {
  let visualViewport: EventTarget & { height: number };
  const keyboardHeight = () => document.documentElement.style.getPropertyValue('--keyboard-height');

  beforeEach(() => {
    visualViewport = Object.assign(new EventTarget(), { height: 700 });
    Object.defineProperty(window, 'visualViewport', { value: visualViewport, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 900, configurable: true });
    document.documentElement.style.removeProperty('--keyboard-height');
  });

  afterEach(() => {
    cleanup();
    document.documentElement.style.removeProperty('--keyboard-height');
  });

  it('does not treat a shrunken visual viewport as a keyboard when no text field has focus', () => {
    render(<Probe />);

    act(() => {
      visualViewport.dispatchEvent(new Event('resize'));
    });

    expect(keyboardHeight()).toBe('0px');
  });

  it('offsets the shell by the shrink while a text field has focus and clears it on blur', () => {
    const { getByTestId } = render(<Probe />);
    const field = getByTestId('field') as HTMLTextAreaElement;

    act(() => {
      field.focus();
      visualViewport.dispatchEvent(new Event('resize'));
    });
    expect(keyboardHeight()).toBe('200px');

    act(() => {
      field.blur();
    });
    expect(keyboardHeight()).toBe('0px');
  });

  it('stops listening once the hook unmounts', () => {
    const { unmount } = render(<Probe />);
    unmount();

    act(() => {
      visualViewport.dispatchEvent(new Event('resize'));
    });

    expect(keyboardHeight()).toBe('');
  });
});

import { useEffect } from 'react';

/** True for a text field — the only thing that can have a virtual keyboard open over it. */
function isEditable(el: EventTarget | Element | null): boolean {
  const node = el as HTMLElement | null;
  if (!node || !node.tagName) return false;
  return node.isContentEditable || node.tagName === 'TEXTAREA' || node.tagName === 'INPUT';
}

/** Keeps the fixed workspace shell above the virtual keyboard in iOS Safari. */
export function useVisualViewportKeyboardOffset() {
  useEffect(() => {
    const visualViewport = window.visualViewport;
    if (!visualViewport) {
      return undefined;
    }

    // `focused` is the element that will hold focus after the event — passed in, because
    // document.activeElement is not reliable inside `focusout`.
    const update = (focused: EventTarget | Element | null) => {
      // Without a focused text field the visual viewport is smaller than the window for other
      // reasons (iPad toolbar, rubber-band, pinch). Counting that as a "keyboard" leaves a blank
      // band under the shell that stays until reload.
      const keyboardHeight = isEditable(focused)
        ? Math.max(0, window.innerHeight - visualViewport.height)
        : 0;
      document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
    };
    const onResize = () => update(document.activeElement);
    const onFocusIn = (e: FocusEvent) => update(e.target);
    const onFocusOut = (e: FocusEvent) => update(e.relatedTarget);

    visualViewport.addEventListener('resize', onResize);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    return () => {
      visualViewport.removeEventListener('resize', onResize);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, []);
}

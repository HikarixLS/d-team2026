import {
  animate,
  createTimeline,
  createTimer,
  stagger,
  spring,
  scrambleText
} from 'animejs';

export function useAnime() {
  /**
   * Hiệu ứng xuất hiện thác nước / so le (stagger) cho danh sách thẻ / phần tử
   */
  const animateStagger = (targets, options = {}) => {
    if (!targets) return null;
    try {
      return animate(targets, {
        opacity: [0, 1],
        y: [16, 0],
        duration: options.duration || 500,
        ease: options.ease || 'outExpo',
        delay: stagger(options.staggerDelay || 50, { from: options.from || 'first' }),
        ...options
      });
    } catch (e) {
      console.warn('[useAnime] animateStagger error:', e);
    }
  };

  /**
   * Hiệu ứng nhảy số / lăn số mượt mà (Number roll-up counter)
   * Sử dụng object phản ứng { val: 0 } -> targetVal
   */
  const animateCounter = (reactiveState, propName, targetVal, duration = 800) => {
    if (!reactiveState) return;
    const startVal = Number(reactiveState[propName]) || 0;
    const endVal = Number(targetVal) || 0;
    if (startVal === endVal) return;

    try {
      return animate(reactiveState, {
        [propName]: endVal,
        duration: duration,
        ease: 'outExpo',
        round: 1
      });
    } catch (e) {
      reactiveState[propName] = endVal;
    }
  };

  /**
   * Hiệu ứng chuyển tab mượt mà (Fade & slide-up)
   */
  const animateTabEnter = (targetEl) => {
    if (!targetEl) return;
    try {
      return animate(targetEl, {
        opacity: [0, 1],
        y: [14, 0],
        duration: 380,
        ease: 'outQuad'
      });
    } catch (e) {
      console.warn('[useAnime] animateTabEnter error:', e);
    }
  };

  /**
   * Hiệu ứng mở modal với gia tốc lò xo (Spring physics)
   */
  const animateModalEnter = (modalContentEl) => {
    if (!modalContentEl) return;
    try {
      return animate(modalContentEl, {
        opacity: [0, 1],
        scale: [0.93, 1],
        duration: 420,
        ease: spring({ mass: 1, stiffness: 140, damping: 15 })
      });
    } catch (e) {
      console.warn('[useAnime] animateModalEnter error:', e);
    }
  };

  /**
   * Hiệu ứng chữ giải mã công nghệ (Scramble text)
   */
  const animateScramble = (targetEl, text, options = {}) => {
    if (!targetEl || !text) return;
    try {
      return animate(targetEl, {
        innerHTML: scrambleText({
          text: text,
          chars: options.chars || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
          revealRate: options.revealRate || 0.1,
          ...options
        }),
        duration: options.duration || 1000,
        ease: 'outQuad'
      });
    } catch (e) {
      targetEl.textContent = text;
    }
  };

  /**
   * Hiệu ứng nhịp đập nhẹ (Pulse / Bounce) cho nút nhấn hoặc icon
   */
  const animatePulse = (targetEl) => {
    if (!targetEl) return;
    try {
      return animate(targetEl, {
        scale: [1, 1.15, 1],
        duration: 400,
        ease: 'outBack'
      });
    } catch (e) { }
  };

  return {
    animate,
    createTimeline,
    createTimer,
    stagger,
    spring,
    animateStagger,
    animateCounter,
    animateTabEnter,
    animateModalEnter,
    animateScramble,
    animatePulse
  };
}

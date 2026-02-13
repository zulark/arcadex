import { ref, watch, onMounted, type Ref } from 'vue';

/**
 * Animates a number from 0 to target value on mount / when target changes.
 * Useful for stats count-up effect.
 */
export function useCountUp(target: Ref<number> | (() => number), duration = 800) {
  const display = ref(0);
  let raf: number | null = null;

  function animate(from: number, to: number) {
    if (raf) cancelAnimationFrame(raf);
    const start = performance.now();
    const diff = to - from;

    function step(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      display.value = Math.round(from + diff * eased);

      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    }
    raf = requestAnimationFrame(step);
  }

  const getValue = typeof target === 'function' ? target : () => target.value;

  onMounted(() => {
    animate(0, getValue());
  });

  watch(getValue, (newVal, oldVal) => {
    animate(oldVal ?? 0, newVal);
  });

  return display;
}

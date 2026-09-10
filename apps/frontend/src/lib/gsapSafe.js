import gsap from 'gsap';

/**
 * gsapSafe — guards against the classic "GSAP target not found" runtime
 * error. GSAP logs an error when a selector matches zero nodes, which
 * happens easily here: product grids render skeletons first, Checkout
 * early-returns null on an empty cart, and heroes render conditionally.
 *
 * Usage (inside useLayoutEffect):
 *   const ctx = gsapSafe.context(ref, () => {
 *     gsapSafe.from(ref, '.product-card', { y: 16, opacity: 0, ... });
 *   });
 *   return () => ctx?.revert();
 *
 * - `context()` returns null when the scope ref has no DOM node yet, so
 *   callers skip cleanup safely (`ctx?.revert()`).
 * - `from / fromTo / to` resolve the selector to real elements inside the
 *   scope first and no-op (return null) when nothing matches, instead of
 *   letting GSAP throw its "target not found" error.
 * - Selectors are always scoped to the ref — never the whole document — so
 *   one page's animation can't grab another page's nodes.
 */
const targetsIn = (scopeRef, selector) => {
  const root = scopeRef?.current;
  if (!root || typeof root.querySelectorAll !== 'function') return [];
  try {
    return gsap.utils.toArray(selector, root);
  } catch {
    return [];
  }
};

const context = (scopeRef, fn) => {
  if (!scopeRef?.current) return null;
  return gsap.context(fn, scopeRef);
};

const from = (scopeRef, selector, vars) => {
  const targets = targetsIn(scopeRef, selector);
  if (targets.length === 0) return null;
  return gsap.from(targets, vars);
};

const fromTo = (scopeRef, selector, fromVars, toVars) => {
  const targets = targetsIn(scopeRef, selector);
  if (targets.length === 0) return null;
  return gsap.fromTo(targets, fromVars, toVars);
};

const to = (scopeRef, selector, vars) => {
  const targets = targetsIn(scopeRef, selector);
  if (targets.length === 0) return null;
  return gsap.to(targets, vars);
};

export const gsapSafe = { context, from, fromTo, to, targetsIn };
export default gsapSafe;

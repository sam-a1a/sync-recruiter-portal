import { flushSync } from "react-dom";
let active: ViewTransition | undefined;

/** Browser snapshots move each named record between its card and row geometry. */
export function animateLayout(update: () => void) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    update();
    return;
  }
  if (!document.startViewTransition) {
    flushSync(update);
    document
      .querySelectorAll(".record-collection, .collection-table")
      .forEach((element) => {
        element.animate(
          [
            { opacity: 0.3, transform: "translateY(6px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 320, easing: "cubic-bezier(.2,0,0,1)" },
        );
      });
    return;
  }
  active?.skipTransition();
  document.documentElement.dataset.layoutTransition = "true";
  const transition = document.startViewTransition(() => flushSync(update));
  active = transition;
  void transition.finished
    .catch(() => {})
    .finally(() => {
      if (active === transition) {
        delete document.documentElement.dataset.layoutTransition;
        active = undefined;
      }
    });
}

import { useLayoutEffect, useRef, type ReactNode } from "react";

/** Keeps content mounted (and drafts/focus intact), animating only paint and measured height. */
export function AnimatedRegion({
  children,
  changeKey,
  className = "",
}: {
  children: ReactNode;
  changeKey?: string | number | boolean;
  className?: string;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const previousKey = useRef(changeKey);
  useLayoutEffect(() => {
    const box = outer.current!,
      content = inner.current!;
    let last = content.getBoundingClientRect().height;
    let resizing: Animation | undefined;
    const observer = new ResizeObserver(() => {
      const next = content.getBoundingClientRect().height;
      if (Math.abs(next - last) < 0.5) return;
      const from =
        resizing?.playState === "running"
          ? box.getBoundingClientRect().height
          : last;
      last = next;
      resizing?.cancel();
      if (
        !matchMedia("(prefers-reduced-motion: reduce)").matches &&
        from > 0 &&
        next > 0
      ) {
        box.dataset.resizing = "true";
        resizing = box.animate(
          [{ height: `${from}px` }, { height: `${next}px` }],
          { duration: 320, easing: "cubic-bezier(.2,0,0,1)" },
        );
        resizing.onfinish = () => {
          delete box.dataset.resizing;
        };
      } else delete box.dataset.resizing;
    });
    observer.observe(content);
    return () => {
      observer.disconnect();
      resizing?.cancel();
    };
  }, []);
  useLayoutEffect(() => {
    if (previousKey.current === changeKey) return;
    previousKey.current = changeKey;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const animation = inner.current?.animate(
      [
        { opacity: 0.25, transform: "translateY(5px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 260, easing: "cubic-bezier(.2,0,0,1)" },
    );
    return () => animation?.cancel();
  }, [changeKey]);
  return (
    <div ref={outer} className={`animated-region ${className}`}>
      <div ref={inner} className="animated-region-content">
        {children}
      </div>
    </div>
  );
}

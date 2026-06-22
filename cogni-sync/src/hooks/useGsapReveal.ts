import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useGsapReveal(stagger = 0.12) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const items = container.querySelectorAll<HTMLElement>('[data-reveal]');
    if (!items.length) return;

    gsap.set(items, { opacity: 0, y: 64, scale: 0.94, rotateX: 8 });

    const tween = gsap.to(items, {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      duration: 0.85,
      ease: 'power3.out',
      stagger,
      scrollTrigger: {
        trigger: container,
        start: 'top 82%',
        toggleActions: 'play none none reverse',
      },
    });

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars?.trigger === container) st.kill();
      });
    };
  }, [stagger]);

  return ref;
}

export function useGsapHeading() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.set(el, { opacity: 0, x: -48 });

    const tween = gsap.to(el, {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });

    return () => {
      tween.kill();
    };
  }, []);

  return ref;
}

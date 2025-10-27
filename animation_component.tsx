
import React, { useEffect, useRef } from 'react';

// This hook uses Intersection Observer to add a 'is-visible' class
// to elements when they enter the viewport, triggering CSS animations.
export const useScrollAnimation = <T extends HTMLElement>() => {
  const elementRef = useRef<T | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // Observe only once
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
      }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      // Find all children with the 'animate-on-scroll' class
      const animatedChildren = currentElement.querySelectorAll('.animate-on-scroll');
      if (animatedChildren.length > 0) {
        animatedChildren.forEach(child => observer.observe(child));
      } else {
        // If no children, observe the element itself
        observer.observe(currentElement);
      }
    }

    return () => {
      if (currentElement) {
        const animatedChildren = currentElement.querySelectorAll('.animate-on-scroll');
        if (animatedChildren.length > 0) {
          animatedChildren.forEach(child => observer.unobserve(child));
        } else if (currentElement) {
            try {
               observer.unobserve(currentElement);
            } catch (e) {
                // Ignore if already unobserved
            }
        }
      }
    };
  }, []);

  return elementRef;
};

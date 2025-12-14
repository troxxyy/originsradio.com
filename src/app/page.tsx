'use client'

import { useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import HomeHero from "@/components/home/HomeHero";

export default function HomePage() {
  // Make homepage completely unscrollable and unswipable
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    // Store previous values for cleanup
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlHeight = html.style.height;
    const prevBodyHeight = body.style.height;
    const prevHtmlTouchAction = html.style.getPropertyValue("touch-action");
    const prevBodyTouchAction = body.style.getPropertyValue("touch-action");
    const prevHtmlOverscroll = html.style.getPropertyValue("overscroll-behavior");
    const prevBodyOverscroll = body.style.getPropertyValue("overscroll-behavior");
    const prevHtmlPosition = html.style.position;
    const prevBodyPosition = body.style.position;

    // Add CSS class for scroll lock
    html.classList.add("homepage-locked");
    body.classList.add("homepage-locked");

    // Apply comprehensive scroll and swipe prevention via inline styles
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.height = "100vh";
    body.style.height = "100vh";
    html.style.position = "fixed";
    body.style.position = "fixed";
    html.style.width = "100%";
    body.style.width = "100%";
    html.style.setProperty("touch-action", "none");
    body.style.setProperty("touch-action", "none");
    html.style.setProperty("overscroll-behavior", "none");
    body.style.setProperty("overscroll-behavior", "none");
    html.style.setProperty("-webkit-overflow-scrolling", "none");
    body.style.setProperty("-webkit-overflow-scrolling", "none");

    // Prevent all touch-based scrolling
    const preventTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };
    
    // Prevent wheel scrolling
    const preventWheel = (e: WheelEvent) => {
      e.preventDefault();
    };

    // Prevent keyboard scrolling
    const preventKeyScroll = (e: KeyboardEvent) => {
      const keys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];
      if (keys.includes(e.key)) {
        e.preventDefault();
      }
    };

    window.addEventListener("touchmove", preventTouchMove, { passive: false });
    window.addEventListener("wheel", preventWheel, { passive: false });
    window.addEventListener("keydown", preventKeyScroll, { passive: false });

    return () => {
      // Cleanup all event listeners
      window.removeEventListener("touchmove", preventTouchMove);
      window.removeEventListener("wheel", preventWheel);
      window.removeEventListener("keydown", preventKeyScroll);
      
      // Remove CSS class
      html.classList.remove("homepage-locked");
      body.classList.remove("homepage-locked");
      
      // Restore all previous styles
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      html.style.height = prevHtmlHeight;
      body.style.height = prevBodyHeight;
      html.style.position = prevHtmlPosition;
      body.style.position = prevBodyPosition;
      html.style.removeProperty("width");
      body.style.removeProperty("width");
      
      if (prevHtmlTouchAction) html.style.setProperty("touch-action", prevHtmlTouchAction);
      else html.style.removeProperty("touch-action");
      if (prevBodyTouchAction) body.style.setProperty("touch-action", prevBodyTouchAction);
      else body.style.removeProperty("touch-action");
      if (prevHtmlOverscroll) html.style.setProperty("overscroll-behavior", prevHtmlOverscroll);
      else html.style.removeProperty("overscroll-behavior");
      if (prevBodyOverscroll) body.style.setProperty("overscroll-behavior", prevBodyOverscroll);
      else body.style.removeProperty("overscroll-behavior");
      
      html.style.removeProperty("-webkit-overflow-scrolling");
      body.style.removeProperty("-webkit-overflow-scrolling");
    };
  }, []);

  return (
    <PageLayout customBackground="bg-transparent" showFooter={false}>
      <HomeHero />
    </PageLayout>
  );
}

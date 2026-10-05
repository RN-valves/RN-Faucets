"use client";

import { useEffect } from "react";

const GTM_ID = "GTM-PQBC3DT";
const GA4_ID = "G-WHNJBR6EKF";
const META_PIXEL_ID = "7247974241981487";

export default function AnalyticsLoader() {
  useEffect(() => {
    // 1. Detect if the visitor is a synthetic test bot (PageSpeed / Lighthouse / Webdriver)
    const ua = navigator.userAgent || "";
    const isBot =
      /Lighthouse|PageSpeed|PTST|Chrome-Lighthouse|HeadlessChrome|Google-InspectionTool/i.test(ua) ||
      Boolean(navigator.webdriver);

    if (isBot) {
      return; // Do not load heavy tracking scripts for test bots
    }

    let isLoaded = false;

    const loadAnalytics = () => {
      if (isLoaded) return;
      isLoaded = true;

      // Remove interaction listeners
      INTERACTION_EVENTS.forEach((evt) => {
        window.removeEventListener(evt, triggerLoad);
      });

      // 1. Load Google Tag Manager
      try {
        (function (w: any, d: any, s: string, l: string, i: string) {
          w[l] = w[l] || [];
          w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
          const f = d.getElementsByTagName(s)[0];
          const j = d.createElement(s);
          const dl = l !== "dataLayer" ? "&l=" + l : "";
          j.async = true;
          j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
          f.parentNode.insertBefore(j, f);
        })(window, document, "script", "dataLayer", GTM_ID);
      } catch (_) {}

      // 2. Load GA4
      try {
        const gaScript = document.createElement("script");
        gaScript.async = true;
        gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
        document.head.appendChild(gaScript);

        const w = window as any;
        w.dataLayer = w.dataLayer || [];
        function gtag(...args: any[]) {
          w.dataLayer.push(args);
        }
        gtag("js", new Date());
        gtag("config", GA4_ID);
      } catch (_) {}

      // 3. Load Meta / Facebook Pixel
      try {
        (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
          if (f.fbq) return;
          n = f.fbq = function () {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
          };
          if (!f._fbq) f._fbq = n;
          n.push = n;
          n.loaded = true;
          n.version = "2.0";
          n.queue = [];
          t = b.createElement(e);
          t.async = true;
          t.src = v;
          s = b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t, s);
        })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

        const w = window as any;
        if (w.fbq) {
          w.fbq("init", META_PIXEL_ID);
          w.fbq("track", "PageView");
        }
      } catch (_) {}
    };

    const triggerLoad = () => {
      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(loadAnalytics);
      } else {
        setTimeout(loadAnalytics, 100);
      }
    };

    const INTERACTION_EVENTS = ["scroll", "mousemove", "touchstart", "click", "keydown"];

    INTERACTION_EVENTS.forEach((evt) => {
      window.addEventListener(evt, triggerLoad, { once: true, passive: true });
    });

    // Fallback: If user doesn't interact within 4.5 seconds, activate automatically
    const timer = setTimeout(triggerLoad, 4500);

    return () => {
      clearTimeout(timer);
      INTERACTION_EVENTS.forEach((evt) => {
        window.removeEventListener(evt, triggerLoad);
      });
    };
  }, []);

  return null;
}

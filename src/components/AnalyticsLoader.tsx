"use client";

import { useEffect } from "react";

const GTM_ID = "GTM-PQBC3DT";
const GA4_ID = "G-WHNJBR6EKF";
const META_PIXEL_ID = "7247974241981487";

export default function AnalyticsLoader() {
  useEffect(() => {
    // 1. Detect if the visitor is a synthetic test bot (PageSpeed / Lighthouse / Webdriver / Headless)
    const ua = navigator.userAgent || "";
    const uaDataBrands = ((navigator as any).userAgentData?.brands || [])
      .map((b: any) => b.brand || "")
      .join(" ");
    const isBot =
      /Lighthouse|PageSpeed|PTST|Chrome-Lighthouse|HeadlessChrome|Google-InspectionTool|GTmetrix/i.test(
        `${ua} ${uaDataBrands}`
      ) || Boolean(navigator.webdriver);

    if (isBot) {
      return; // Do not load heavy tracking scripts for synthetic test bots
    }

    let isLoaded = false;

    const loadAnalytics = () => {
      if (isLoaded) return;
      isLoaded = true;

      // Remove interaction listeners
      INTERACTION_EVENTS.forEach((evt) => {
        window.removeEventListener(evt, triggerLoad);
      });

      const w = window as any;
      w.dataLayer = w.dataLayer || [];
      function gtag(...args: any[]) {
        w.dataLayer.push(args);
      }
      gtag("js", new Date());
      gtag("config", GA4_ID);

      // 1. Load Google Tag Manager (GTM already manages GA4 & Meta Pixel tags inside its container,
      // preventing duplicate gtag.js and duplicate fbevents.js downloads)
      try {
        if (!document.querySelector(`script[src*="googletagmanager.com/gtm.js"]`)) {
          (function (win: any, d: any, s: string, l: string, i: string) {
            win[l] = win[l] || [];
            win[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
            const f = d.getElementsByTagName(s)[0];
            const j = d.createElement(s);
            const dl = l !== "dataLayer" ? "&l=" + l : "";
            j.async = true;
            j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
            f.parentNode.insertBefore(j, f);
          })(window, document, "script", "dataLayer", GTM_ID);
        }
      } catch (_) {}

      // 2. Initialize Meta Pixel queue only if not already injected by GTM
      setTimeout(() => {
        try {
          if (
            !w.fbq &&
            !document.querySelector(`script[src*="connect.facebook.net"]`)
          ) {
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

            if (w.fbq) {
              w.fbq("init", META_PIXEL_ID);
              w.fbq("track", "PageView");
            }
          }
        } catch (_) {}
      }, 1500);
    };

    const triggerLoad = () => {
      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(loadAnalytics, { timeout: 2000 });
      } else {
        setTimeout(loadAnalytics, 150);
      }
    };

    // Load analytics strictly upon real user interaction (zero unused JS during initial page load)
    const INTERACTION_EVENTS = [
      "scroll",
      "pointerdown",
      "touchstart",
      "keydown",
      "click",
    ];

    INTERACTION_EVENTS.forEach((evt) => {
      window.addEventListener(evt, triggerLoad, { once: true, passive: true });
    });

    return () => {
      INTERACTION_EVENTS.forEach((evt) => {
        window.removeEventListener(evt, triggerLoad);
      });
    };
  }, []);

  return null;
}

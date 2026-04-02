import "open-props/open-props.min.css";
import "open-props/normalize.min.css";
import "./styles.css";

import { autoUpdate, computePosition, flip, offset, shift } from "@floating-ui/dom";
import { createIcons, Orbit, Palette, ScanSearch, Shapes, Sparkles, Captions } from "lucide";
import { animate, stagger } from "motion";

createIcons({
  icons: {
    Orbit,
    Palette,
    ScanSearch,
    Shapes,
    Sparkles,
    Captions,
  },
});

const hero = document.querySelector(".lab-hero");
const cards = document.querySelectorAll("[data-lab-card]");

if (hero) {
  animate(
    hero,
    { opacity: [0, 1], transform: ["translateY(24px)", "translateY(0px)"] },
    { duration: 0.45, easing: "ease-out" }
  );
}

if (cards.length) {
  animate(
    cards,
    { opacity: [0, 1], transform: ["translateY(28px)", "translateY(0px)"] },
    { delay: stagger(0.08), duration: 0.4, easing: "ease-out" }
  );
}

const anchor = document.getElementById("tooltip-anchor");
const tooltip = document.getElementById("floating-tip");

if (anchor && tooltip) {
  const cleanup = autoUpdate(anchor, tooltip, async () => {
    const { x, y } = await computePosition(anchor, tooltip, {
      placement: "top-start",
      middleware: [offset(12), flip(), shift({ padding: 10 })],
    });

    Object.assign(tooltip.style, {
      left: `${x}px`,
      top: `${y}px`,
    });
  });

  const show = () => {
    tooltip.dataset.open = "true";
  };

  const hide = () => {
    tooltip.dataset.open = "false";
  };

  anchor.addEventListener("mouseenter", show);
  anchor.addEventListener("focus", show);
  anchor.addEventListener("mouseleave", hide);
  anchor.addEventListener("blur", hide);
  hide();

  window.addEventListener("beforeunload", cleanup, { once: true });
}

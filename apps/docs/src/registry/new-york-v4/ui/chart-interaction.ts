"use client";

import {
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

type ChartItemElement = HTMLElement | SVGElement;

export type ChartInteractionProps = {
  "aria-pressed": boolean;
  "data-chart-item-index": number;
  onBlur: (event: FocusEvent<ChartItemElement>) => void;
  onClick: () => void;
  onFocus: () => void;
  onKeyDown: (event: KeyboardEvent<ChartItemElement>) => void;
  onPointerEnter: (event: PointerEvent<ChartItemElement>) => void;
  onPointerLeave: (event: PointerEvent<ChartItemElement>) => void;
};

export type ChartInteraction = {
  activeIndex: number | null;
  clearSelection: () => void;
  getItemProps: (index: number) => ChartInteractionProps;
  interactionProps: {
    "data-chart-interaction": string;
    "data-chart-viewport": string;
    onPointerLeave: (event: PointerEvent<ChartItemElement>) => void;
  };
  hasEnteredView: boolean;
  selectedIndex: number | null;
  selectIndex: (index: number | null) => void;
};

export function useChartInView(viewportId: string): boolean {
  const [hasEnteredView, setHasEnteredView] = useState(false);

  useEffect(() => {
    if (hasEnteredView) return;

    const root = document.querySelector(
      `[data-chart-viewport="${viewportId}"]`,
    );

    if (!root || typeof IntersectionObserver === "undefined") {
      setHasEnteredView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setHasEnteredView(true);
        observer.disconnect();
      },
      { threshold: 0.2 },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, [hasEnteredView, viewportId]);

  return hasEnteredView;
}

/**
 * Shared intent model for SVG charts: hover/focus is temporary while click,
 * tap, Enter, or Space pins a selection until Escape or an outside press.
 */
export function useChartInteraction(
  interactionId: string,
  itemCount: number,
): ChartInteraction {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const hasEnteredView = useChartInView(interactionId);

  useEffect(() => {
    setHoveredIndex((index) =>
      index !== null && index >= itemCount ? null : index,
    );
    setSelectedIndex((index) =>
      index !== null && index >= itemCount ? null : index,
    );
  }, [itemCount]);

  useEffect(() => {
    if (selectedIndex === null) return;

    function handlePointerDown(event: globalThis.PointerEvent) {
      const target = event.target;

      if (
        target instanceof Element &&
        target.closest(`[data-chart-interaction="${interactionId}"]`)
      ) {
        return;
      }

      setSelectedIndex(null);
      setHoveredIndex(null);
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") return;
      setSelectedIndex(null);
      setHoveredIndex(null);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [interactionId, selectedIndex]);

  const focusItem = useCallback(
    (index: number) => {
      const root = document.querySelector<HTMLElement>(
        `[data-chart-interaction="${interactionId}"]`,
      );
      const item = root?.querySelector<HTMLElement>(
        `[data-chart-item-index="${index}"]`,
      );
      item?.focus();
    },
    [interactionId],
  );

  const getItemProps = useCallback(
    (index: number): ChartInteractionProps => ({
      "aria-pressed": selectedIndex === index,
      "data-chart-item-index": index,
      onBlur: (event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setHoveredIndex(null);
        }
      },
      onClick: () => {
        setHoveredIndex(null);
        setSelectedIndex((current) => (current === index ? null : index));
      },
      onFocus: () => setHoveredIndex(index),
      onKeyDown: (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setHoveredIndex(null);
          setSelectedIndex((current) => (current === index ? null : index));
          return;
        }

        const direction =
          event.key === "ArrowRight" || event.key === "ArrowDown"
            ? 1
            : event.key === "ArrowLeft" || event.key === "ArrowUp"
              ? -1
              : 0;

        if (!direction || itemCount < 2) return;
        event.preventDefault();
        const nextIndex = (index + direction + itemCount) % itemCount;
        setHoveredIndex(nextIndex);
        focusItem(nextIndex);
      },
      onPointerEnter: (event) => {
        if (event.pointerType !== "touch") setHoveredIndex(index);
      },
      onPointerLeave: (event) => {
        if (event.pointerType !== "touch") setHoveredIndex(null);
      },
    }),
    [focusItem, itemCount, selectedIndex],
  );

  return {
    activeIndex: hoveredIndex ?? selectedIndex,
    clearSelection: () => {
      setHoveredIndex(null);
      setSelectedIndex(null);
    },
    getItemProps,
    interactionProps: {
      "data-chart-interaction": interactionId,
      "data-chart-viewport": interactionId,
      onPointerLeave: (event) => {
        if (event.pointerType !== "touch") setHoveredIndex(null);
      },
    },
    hasEnteredView,
    selectedIndex,
    selectIndex: (index) => {
      setHoveredIndex(null);
      setSelectedIndex(
        index !== null && index >= 0 && index < itemCount ? index : null,
      );
    },
  };
}

"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { createPortal } from "react-dom";
import styles from "./FilterSelect.module.css";

export type FilterSelectOption = { value: string; label: string };

type Coords = {
  left: number;
  width: number;
  maxHeight: number;
  placement: "below" | "above";
  top: number;
};

const GAP = 6;
const VIEW_MARGIN = 10;
const MIN_MENU = 120;

/** Visible viewport (layout coords) — better on mobile when keyboard / bars resize the visual viewport. */
function getVisibleViewport(): { top: number; bottom: number; left: number; width: number } {
  if (typeof window === "undefined") {
    return { top: 0, bottom: 0, left: 0, width: 0 };
  }
  const vv = window.visualViewport;
  if (vv) {
    const top = vv.offsetTop;
    const bottom = vv.offsetTop + vv.height;
    return { top, bottom, left: vv.offsetLeft, width: vv.width };
  }
  const h = window.innerHeight;
  return { top: 0, bottom: h, left: 0, width: window.innerWidth };
}

export function FilterSelect({
  id,
  value,
  onChange,
  options,
  "aria-label": ariaLabel
}: {
  id: string;
  value: string;
  onChange: (next: string) => void;
  options: FilterSelectOption[];
  "aria-label"?: string;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [highlight, setHighlight] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const resolvedIndex = useMemo(() => {
    const i = options.findIndex((o) => o.value === value);
    return i >= 0 ? i : 0;
  }, [options, value]);

  const displayLabel = useMemo(() => {
    const found = options.find((o) => o.value === value);
    return found?.label ?? options[0]?.label ?? "";
  }, [options, value]);

  const measure = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger || typeof window === "undefined") return;

    const rect = trigger.getBoundingClientRect();
    const vis = getVisibleViewport();

    const spaceBelow = vis.bottom - rect.bottom - GAP - VIEW_MARGIN;
    const spaceAbove = rect.top - vis.top - GAP - VIEW_MARGIN;

    const preferredMax = Math.min(320, Math.max(MIN_MENU, options.length * 44 + 12));

    let placement: "below" | "above";
    let maxHeight: number;

    if (spaceBelow >= preferredMax || spaceBelow >= spaceAbove) {
      placement = "below";
      maxHeight = Math.max(MIN_MENU, Math.min(preferredMax, spaceBelow));
    } else {
      placement = "above";
      maxHeight = Math.max(MIN_MENU, Math.min(preferredMax, spaceAbove));
    }

    let left = rect.left;
    const maxW = vis.width - VIEW_MARGIN * 2;
    const width = Math.min(Math.max(rect.width, 120), maxW);
    const rightEdge = vis.left + vis.width - VIEW_MARGIN;
    if (left + width > rightEdge) {
      left = rightEdge - width;
    }
    if (left < vis.left + VIEW_MARGIN) {
      left = vis.left + VIEW_MARGIN;
    }

    let top: number;
    if (placement === "below") {
      top = rect.bottom + GAP;
    } else {
      top = Math.max(vis.top + VIEW_MARGIN, rect.top - maxHeight - GAP);
    }

    setCoords({ left, width, maxHeight, placement, top });
  }, [options.length]);

  useLayoutEffect(() => {
    if (!open) return;
    measure();
  }, [open, measure]);

  useEffect(() => {
    if (!open) return;

    const onScrollOrResize = () => measure();
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", onScrollOrResize);
    vv?.addEventListener("scroll", onScrollOrResize);

    return () => {
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
      vv?.removeEventListener("resize", onScrollOrResize);
      vv?.removeEventListener("scroll", onScrollOrResize);
    };
  }, [open, measure]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) setHighlight(resolvedIndex);
  }, [open, resolvedIndex]);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  const pick = useCallback(
    (v: string) => {
      onChange(v);
      close();
    },
    [onChange, close]
  );

  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(options.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setHighlight(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setHighlight(options.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const opt = options[highlight];
      if (opt) pick(opt.value);
    }
  };

  useEffect(() => {
    if (!open || !menuRef.current) return;
    const el = menuRef.current.querySelector<HTMLElement>(`[data-index="${highlight}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [highlight, open]);

  const menu =
    open &&
    coords &&
    typeof document !== "undefined" &&
    createPortal(
      <>
        <div
          className={styles.backdrop}
          aria-hidden
          onClick={close}
          onPointerDown={(e) => e.preventDefault()}
        />
        <ul
          ref={menuRef}
          id={listId}
          role="listbox"
          className={`${styles.menu} ${coords.placement === "below" ? styles.menuBelow : styles.menuAbove}`}
          style={{
            left: coords.left,
            width: coords.width,
            maxHeight: coords.maxHeight,
            top: coords.top
          }}
        >
          {options.map((opt, i) => (
            <li key={opt.value === "" ? "__empty" : opt.value} role="presentation">
              <button
                type="button"
                role="option"
                data-index={i}
                aria-selected={opt.value === value}
                className={`${styles.option} ${opt.value === value ? styles.optionSelected : ""} ${
                  i === highlight ? styles.optionHighlight : ""
                }`}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => pick(opt.value)}
              >
                <span className={styles.optionCheck} aria-hidden>
                  {opt.value === value ? "✓" : ""}
                </span>
                <span className={styles.optionLabel}>{opt.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </>,
      document.body
    );

  return (
    <div className={styles.root}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onTriggerKeyDown}
      >
        <span className={styles.triggerText}>{displayLabel}</span>
        <svg
          className={`${styles.triggerChevron} ${open ? styles.triggerChevronOpen : ""}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      {menu}
    </div>
  );
}

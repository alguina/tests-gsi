"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/ui/cn";

type DropdownTriggerProps = {
  onClick: () => void;
  "aria-expanded": boolean;
  "aria-controls": string;
  "aria-haspopup": "menu";
};

type DropdownProps = {
  trigger: (props: DropdownTriggerProps) => ReactNode;
  children: ReactNode;
  align?: "start" | "end";
  className?: string;
  menuClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type MenuPosition = {
  top: number;
  left: number;
  width: number;
};

const MENU_MIN_WIDTH = 288;
const VIEWPORT_PADDING = 8;

export function Dropdown({
  trigger,
  children,
  align = "start",
  className,
  menuClassName,
  open: openProp,
  onOpenChange,
}: DropdownProps) {
  const menuId = useId();
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = openProp ?? uncontrolledOpen;
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const [mounted, setMounted] = useState(false);

  const setOpen = useCallback(
    (next: boolean) => {
      if (openProp === undefined) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [onOpenChange, openProp],
  );

  const close = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const toggle = useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    const triggerElement = triggerRef.current;
    if (!triggerElement) {
      return;
    }

    const rect = triggerElement.getBoundingClientRect();
    const menuWidth = Math.max(rect.width, MENU_MIN_WIDTH);
    let left =
      align === "end" ? rect.right - menuWidth : rect.left;

    left = Math.max(
      VIEWPORT_PADDING,
      Math.min(left, window.innerWidth - menuWidth - VIEWPORT_PADDING),
    );

    let top = rect.bottom + 8;
    const estimatedHeight = menuRef.current?.offsetHeight ?? 220;

    if (top + estimatedHeight > window.innerHeight - VIEWPORT_PADDING) {
      top = Math.max(VIEWPORT_PADDING, rect.top - estimatedHeight - 8);
    }

    setPosition({ top, left, width: menuWidth });
  }, [align]);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      close();
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }

    function handleReposition() {
      updatePosition();
    }

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [close, open, updatePosition]);

  return (
    <>
      <div ref={triggerRef} className={className}>
        {trigger({
          onClick: toggle,
          "aria-expanded": open,
          "aria-controls": menuId,
          "aria-haspopup": "menu",
        })}
      </div>

      {mounted && open && position
        ? createPortal(
            <div
              ref={menuRef}
              id={menuId}
              role="menu"
              className={cn(
                "fixed z-50 rounded-2xl border border-border bg-surface shadow-lg",
                menuClassName,
              )}
              style={{
                top: position.top,
                left: position.left,
                width: position.width,
              }}
            >
              {children}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

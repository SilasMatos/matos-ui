"use client";

import {
  AnimatePresence,
  type HTMLMotionProps,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { MoreHorizontal, X } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
} from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const detailPanelVariants = tv({
  base: [
    "w-full max-w-[420px] overflow-hidden rounded-2xl border border-border",
    "bg-secondary text-foreground shadow-xl",
  ],
});

const fadeUp = (delay = 0) =>
  ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.35,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
      delay,
    },
  }) as const;

const listVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.055 },
  },
};

const rowItemVariants: Variants = {
  hidden: { opacity: 0, x: -6 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

type DetailPanelContextValue = {
  onClose?: () => void;
};

const DetailPanelContext = createContext<DetailPanelContextValue | null>(null);

function useDetailPanelContext() {
  return useContext(DetailPanelContext);
}

export type DetailPanelProps = Omit<HTMLMotionProps<"div">, "children"> &
  VariantProps<typeof detailPanelVariants> & {
    open?: boolean;
    onClose?: () => void;
    children?: ReactNode;
  };

function DetailPanel({
  className,
  open = true,
  onClose,
  children,
  ...motionProps
}: DetailPanelProps) {
  const shouldReduceMotion = useReducedMotion();

  const panelVariants: Variants = {
    hidden: shouldReduceMotion
      ? { opacity: 0 }
      : { opacity: 0, scale: 0.96, y: 8 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
    exit: shouldReduceMotion
      ? { opacity: 0 }
      : {
          opacity: 0,
          scale: 0.97,
          y: 4,
          transition: { duration: 0.2, ease: "easeIn" },
        },
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="detail-panel"
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          data-slot="detail-panel"
          className={twMerge(detailPanelVariants(), className)}
          {...motionProps}
        >
          <DetailPanelContext.Provider value={{ onClose }}>
            {children}
          </DetailPanelContext.Provider>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function DetailPanelHeader({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  const ctx = useDetailPanelContext();

  return (
    <motion.div
      {...fadeUp(0)}
      data-slot="detail-panel-header"
      className={twMerge(
        "flex items-center justify-between px-5 pt-5 pb-4",
        className,
      )}
    >
      <span className="text-sm font-semibold tracking-[-0.01em]">
        {children}
      </span>
      {ctx?.onClose ? (
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={ctx.onClose}
          aria-label="Close panel"
          className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="sr-only">Close</span>
          <X className="size-4" strokeWidth={2} aria-hidden="true" />
        </motion.button>
      ) : null}
    </motion.div>
  );
}

function DetailPanelContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="detail-panel-content"
      className={twMerge(
        " space-y-4 rounded-xl border-y border-border bg-card p-5",
        className,
      )}
      {...props}
    />
  );
}

function DetailPanelFooter({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <motion.div
      {...fadeUp(0.48)}
      data-slot="detail-panel-footer"
      className={twMerge("flex items-center gap-2 px-5 py-2", className)}
    >
      {children}
    </motion.div>
  );
}

function DetailPanelSeparator({ className }: { className?: string }) {
  return (
    <motion.div
      {...fadeUp(0.1)}
      data-slot="detail-panel-separator"
      className={twMerge(
        "h-1 w-full shrink-0 bg-repeat-x bg-position-[center_top]",
        "bg-[radial-gradient(circle,var(--border)_1px,transparent_1.5px)]",
        "bg-size-[12px_4px]",
        className,
      )}
    />
  );
}

export type DetailPanelHighlightProps = {
  label?: ReactNode;
  primary: ReactNode;
  secondary?: ReactNode;
  className?: string;
};

function DetailPanelHighlight({
  label,
  primary,
  secondary,
  className,
}: DetailPanelHighlightProps) {
  return (
    <motion.div
      {...fadeUp(0.06)}
      data-slot="detail-panel-highlight"
      className={className}
    >
      {label ? (
        <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
      ) : null}
      <div className="flex items-baseline gap-0.5">
        <span className="text-[40px] font-semibold leading-none tracking-[-0.03em]">
          {primary}
        </span>
        {secondary ? (
          <span className="text-[22px] font-normal leading-none text-muted-foreground">
            {secondary}
          </span>
        ) : null}
      </div>
    </motion.div>
  );
}

function DetailPanelRows({
  className,
  children,
}: Pick<HTMLMotionProps<"div">, "className" | "children">) {
  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="show"
      data-slot="detail-panel-rows"
      className={twMerge("space-y-2.5", className)}
    >
      {children}
    </motion.div>
  );
}

export type DetailPanelRowProps = {
  icon?: ReactNode;
  label: ReactNode;
  value: ReactNode;
  className?: string;
};

function DetailPanelRow({
  icon,
  label,
  value,
  className,
}: DetailPanelRowProps) {
  return (
    <motion.div
      variants={rowItemVariants}
      data-slot="detail-panel-row"
      className={twMerge("flex min-w-0 items-center gap-2.5", className)}
    >
      {icon ? (
        <span className="flex w-4 shrink-0 items-center justify-center [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:text-muted-foreground">
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1 text-[12px] text-muted-foreground">
        {label}
      </span>
      <span className="shrink-0 text-right text-[12px] text-foreground">
        {value}
      </span>
    </motion.div>
  );
}

export type DetailPanelNoteProps = {
  label?: ReactNode;
  children: ReactNode;
  className?: string;
};

function DetailPanelNote({
  label = "Note",
  children,
  className,
}: DetailPanelNoteProps) {
  return (
    <motion.div
      {...fadeUp(0.35)}
      data-slot="detail-panel-note"
      className={twMerge("space-y-1.5", className)}
    >
      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="rounded-xl border border-border bg-muted/30 p-3 text-[12px] leading-relaxed text-muted-foreground">
        {children}
      </div>
    </motion.div>
  );
}

function DetailPanelAttachments({
  className,
  children,
}: ComponentProps<"div">) {
  return (
    <motion.div
      {...fadeUp(0.42)}
      data-slot="detail-panel-attachments"
      className={twMerge("space-y-1.5", className)}
    >
      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        Attachments
      </p>
      {children}
    </motion.div>
  );
}

export type DetailPanelAttachmentProps = {
  name: ReactNode;
  meta?: ReactNode;
  icon?: ReactNode;
  onMenuClick?: () => void;
  className?: string;
};

function DetailPanelAttachment({
  name,
  meta,
  icon,
  onMenuClick,
  className,
}: DetailPanelAttachmentProps) {
  return (
    <motion.div
      className={twMerge(
        "flex min-w-0 cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-muted/20 p-2.5 transition-colors hover:bg-accent",
        className,
      )}
      data-slot="detail-panel-attachment"
    >
      <span className="shrink-0 text-muted-foreground [&_svg]:size-7">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] text-foreground/80">{name}</p>
      </div>
      {meta ? (
        <span className="shrink-0 text-[11px] text-muted-foreground">
          {meta}
        </span>
      ) : null}
      {onMenuClick ? (
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onMenuClick();
          }}
          aria-label="Attachment options"
          className="flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="sr-only">More options</span>
          <MoreHorizontal
            className="size-4"
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </motion.button>
      ) : null}
    </motion.div>
  );
}

export type DetailPanelFooterActionProps = {
  ariaLabel: string;
  icon: ReactNode;
  onClick?: () => void;
  className?: string;
};

function DetailPanelFooterAction({
  ariaLabel,
  icon,
  onClick,
  className,
}: DetailPanelFooterActionProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      aria-label={ariaLabel}
      onClick={onClick}
      data-slot="detail-panel-footer-action"
      className={twMerge(
        "flex size-8 items-center justify-center rounded-lg bg-accent text-muted-foreground transition-colors hover:bg-accent/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {icon}
    </motion.button>
  );
}

export {
  DetailPanel,
  DetailPanelHeader,
  DetailPanelContent,
  DetailPanelFooter,
  DetailPanelSeparator,
  DetailPanelHighlight,
  DetailPanelRows,
  DetailPanelRow,
  DetailPanelNote,
  DetailPanelAttachments,
  DetailPanelAttachment,
  DetailPanelFooterAction,
};

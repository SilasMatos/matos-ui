"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { AlertCircle, Check, FileText, Loader2, Upload, X } from "lucide-react";
import {
  type ChangeEvent,
  type ComponentProps,
  type DragEvent,
  type KeyboardEvent,
  useCallback,
  useId,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

import {
  spring,
  staggerContainer,
} from "@/registry/new-york-v4/lib/motion-tokens";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

export const fileUploadVariants = tv({
  slots: {
    root: "not-prose w-full rounded-2xl p-2 text-foreground",
    dropzone: [
      "group/dropzone relative flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border/60 p-3 text-left",
      "transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out",
      "hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
    ],
    iconWrap: [
      "flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-muted text-muted-foreground",
      "transition-[background-color,color,transform] duration-200 ease-out",
      "group-hover/dropzone:text-foreground",
    ],
    copy: "min-w-0 flex-1",
    header: "flex min-w-0 flex-wrap items-center gap-2",
    title: "truncate text-sm font-medium leading-none text-foreground",
    description: "mt-1 truncate text-xs leading-5 text-muted-foreground",
    badge:
      "max-w-full shrink-0 truncate rounded-md border border-border/70 bg-muted px-1.5 py-0.5 text-[10px] font-medium leading-none text-muted-foreground",
    list: "mt-2 flex flex-col gap-1.5",
    item: [
      "group/item grid grid-cols-[1rem_minmax(0,1fr)_auto_auto] items-center gap-2 rounded-lg border border-border/60 bg-background px-2.5 py-2 text-xs",
      "transition-colors duration-200 hover:bg-muted/30",
    ],
    fileIcon: "size-4 text-muted-foreground",
    fileName: "truncate text-xs font-medium text-foreground",
    fileMeta:
      "mt-0.5 flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground",
    status:
      "shrink-0 rounded-md border border-border/60 bg-muted px-1.5 py-0.5 text-[10px] font-medium leading-none text-muted-foreground",
    removeButton: [
      "inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors duration-200",
      "hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      "disabled:pointer-events-none disabled:opacity-50",
    ],
    error: "mt-2 flex items-center gap-1.5 text-xs text-muted-foreground",
    progressTrack: "mt-1.5 h-1 overflow-hidden rounded-full bg-muted",
    progressBar: "h-full rounded-full bg-primary",
  },
  variants: {
    variant: {
      default: {
        root: "bg-secondary",
        dropzone: "bg-card",
      },
      outline: {
        root: "bg-transparent",
        dropzone: "border-border bg-card",
      },
      ghost: {
        root: "border-transparent bg-secondary/60",
        dropzone: "border-transparent bg-card/80 shadow-none hover:bg-muted/30",
      },
    },
    size: {
      sm: {
        root: "p-1.5",
        dropzone: "gap-2.5 p-2.5",
        iconWrap: "size-8 rounded-md [&_svg]:size-4",
        description: "mt-0.5",
      },
      md: {
        root: "p-2",
        dropzone: "p-3",
        iconWrap: "[&_svg]:size-4",
      },
      lg: {
        root: "p-2.5",
        dropzone: "p-4",
        iconWrap: "size-10 [&_svg]:size-4.5",
      },
    },
    isDragging: {
      true: {
        dropzone: "border-ring bg-muted/40 shadow-sm",
        iconWrap: "text-foreground",
      },
      false: {},
    },
    state: {
      default: {},
      uploading: {
        dropzone: "border-border bg-muted/25",
      },
      success: {
        dropzone: "border-border bg-muted/25",
      },
      error: {
        dropzone: "border-border bg-muted/35",
      },
    },
    disabled: {
      true: {
        root: "opacity-60",
      },
      false: {},
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
    isDragging: false,
    state: "default",
    disabled: false,
  },
});

export type FileUploadFileStatus = "idle" | "uploading" | "success" | "error";

export interface FileUploadFile {
  file: File;
  id: string;
  error?: string;
  status?: FileUploadFileStatus;
  progress?: number;
}

export type FileUploadProps = ComponentProps<"div"> &
  VariantProps<typeof fileUploadVariants> & {
    accept?: string;
    multiple?: boolean;
    maxSize?: number;
    maxFiles?: number;
    files?: FileUploadFile[];
    onFilesChange?: (files: FileUploadFile[]) => void;
    title?: string;
    description?: string;
    disabled?: boolean;
    uploading?: boolean;
  };

const smoothEase = [0.22, 1, 0.36, 1] as const;

const listVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    ...staggerContainer("fast").visible,
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 6, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: spring.fast,
  },
  exit: {
    opacity: 0,
    x: 8,
    scale: 0.98,
    transition: spring.fast,
  },
};

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );

  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${
    units[index]
  }`;
}

function formatAccept(accept?: string) {
  if (!accept) {
    return "Any file";
  }

  return accept
    .split(",")
    .slice(0, 3)
    .map((item) => item.trim().replace("image/*", "images"))
    .join(", ");
}

function getEntryStatus(entry: FileUploadFile): FileUploadFileStatus {
  if (entry.error) {
    return "error";
  }

  return entry.status ?? "success";
}

function getStatusLabel(status: FileUploadFileStatus) {
  if (status === "uploading") {
    return "Uploading";
  }

  if (status === "success") {
    return "Ready";
  }

  if (status === "error") {
    return "Invalid";
  }

  return "Queued";
}

export function FileUpload({
  className,
  variant = "default",
  size = "md",
  state,
  accept,
  multiple = false,
  maxSize,
  maxFiles,
  files: controlledFiles,
  onFilesChange,
  title,
  description,
  disabled = false,
  uploading = false,
  ...props
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const shouldReduceMotion = useReducedMotion();
  const [dragging, setDragging] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [internalFiles, setInternalFiles] = useState<FileUploadFile[]>([]);

  const isControlled = controlledFiles !== undefined;
  const files = isControlled ? controlledFiles : internalFiles;
  const hasError = Boolean(lastError || files.some((entry) => entry.error));
  const resolvedState =
    state ?? (hasError ? "error" : uploading ? "uploading" : "default");

  const styles = fileUploadVariants({
    variant,
    size,
    isDragging: dragging,
    disabled,
    state: resolvedState,
  });

  const updateFiles = useCallback(
    (next: FileUploadFile[]) => {
      if (!isControlled) {
        setInternalFiles(next);
      }

      onFilesChange?.(next);
    },
    [isControlled, onFilesChange],
  );

  const validateFile = useCallback(
    (file: File): string | undefined => {
      if (maxSize && file.size > maxSize) {
        return `Larger than ${formatFileSize(maxSize)}`;
      }

      return undefined;
    },
    [maxSize],
  );

  const addFiles = useCallback(
    (incoming: File[]) => {
      if (disabled || incoming.length === 0) {
        return;
      }

      setLastError(null);

      const allowedSlots = multiple
        ? Math.max(
            (maxFiles ?? incoming.length + files.length) - files.length,
            0,
          )
        : 1;

      if (multiple && maxFiles && files.length + incoming.length > maxFiles) {
        setLastError(`Maximum ${maxFiles} files`);
      }

      if (allowedSlots === 0) {
        return;
      }

      const entries: FileUploadFile[] = incoming
        .slice(0, allowedSlots)
        .map((file) => {
          const error = validateFile(file);

          return {
            file,
            id: generateId(),
            error,
            status: error ? "error" : uploading ? "uploading" : "success",
            progress: uploading && !error ? 48 : undefined,
          };
        });

      updateFiles(multiple ? [...files, ...entries] : entries.slice(0, 1));
    },
    [disabled, files, maxFiles, multiple, updateFiles, uploading, validateFile],
  );

  const removeFile = useCallback(
    (id: string) => {
      updateFiles(files.filter((entry) => entry.id !== id));
    },
    [files, updateFiles],
  );

  const openFileDialog = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

  const handleDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (!disabled) {
        setDragging(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setDragging(false);

      addFiles(Array.from(event.dataTransfer.files ?? []));
    },
    [addFiles],
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      addFiles(Array.from(event.target.files ?? []));
      event.target.value = "";
    },
    [addFiles],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openFileDialog();
      }
    },
    [openFileDialog],
  );

  const defaultTitle = dragging ? "Drop files here" : "Upload files";
  const defaultDescription = multiple
    ? "Drag files here or choose from your device"
    : "Drag a file here or choose from your device";

  return (
    <Elevated
      data-slot="file-upload"
      offset={1}
      className={twMerge(styles.root(), className)}
      {...props}
    >
      <Elevated offset={1} className="rounded-xl">
        <motion.div
          data-slot="file-upload-dropzone"
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={title ?? defaultTitle}
          aria-disabled={disabled}
          data-disabled={disabled}
          onClick={openFileDialog}
          onKeyDown={handleKeyDown}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={styles.dropzone()}
          animate={
            shouldReduceMotion
              ? undefined
              : hasError
                ? { x: [0, -2, 2, -1, 1, 0] }
                : { scale: dragging ? 1.01 : 1 }
          }
          whileHover={
            shouldReduceMotion || disabled ? undefined : { y: -1, scale: 1.002 }
          }
          whileTap={
            shouldReduceMotion || disabled ? undefined : { scale: 0.998 }
          }
          transition={
            hasError ? { duration: 0.24, ease: smoothEase } : spring.fast
          }
        >
          <motion.span
            className={styles.iconWrap()}
            animate={
              shouldReduceMotion
                ? undefined
                : { y: dragging ? -1 : 0, scale: dragging ? 1.04 : 1 }
            }
            transition={{ duration: 0.22, ease: smoothEase }}
            aria-hidden="true"
          >
            {resolvedState === "uploading" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : resolvedState === "success" ? (
              <motion.span
                initial={
                  shouldReduceMotion ? false : { scale: 0.7, opacity: 0 }
                }
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.18, ease: smoothEase }}
              >
                <Check className="size-4" />
              </motion.span>
            ) : resolvedState === "error" ? (
              <AlertCircle className="size-4" />
            ) : (
              <Upload className="size-4" />
            )}
          </motion.span>

          <div className={styles.copy()}>
            <div className={styles.header()}>
              <span className={styles.title()}>{title ?? defaultTitle}</span>
              <span className={styles.badge()}>{formatAccept(accept)}</span>
            </div>
            <p className={styles.description()}>
              {description ?? defaultDescription}
            </p>
          </div>
        </motion.div>
      </Elevated>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        className="sr-only"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleChange}
      />

      <AnimatePresence initial={false}>
        {(files.length > 0 || lastError) && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={spring.fast}
          >
            {lastError ? (
              <p className={styles.error()} aria-live="polite">
                <AlertCircle className="size-3.5" aria-hidden="true" />
                {lastError}
              </p>
            ) : null}

            {files.length > 0 ? (
              <motion.ul
                data-slot="file-upload-list"
                className={styles.list()}
                variants={shouldReduceMotion ? undefined : listVariants}
                initial={shouldReduceMotion ? false : "hidden"}
                animate="visible"
              >
                <AnimatePresence initial={false}>
                  {files.map((entry) => {
                    const status = getEntryStatus(entry);
                    const progress =
                      entry.progress ?? (status === "uploading" ? 52 : 100);

                    return (
                      <motion.li
                        key={entry.id}
                        data-slot="file-upload-item"
                        layout
                        className={styles.item()}
                        variants={shouldReduceMotion ? undefined : itemVariants}
                        initial={shouldReduceMotion ? { opacity: 0 } : "hidden"}
                        animate={
                          shouldReduceMotion ? { opacity: 1 } : "visible"
                        }
                        exit={shouldReduceMotion ? { opacity: 0 } : "exit"}
                      >
                        <FileText
                          className={styles.fileIcon()}
                          aria-hidden="true"
                        />

                        <div className="min-w-0">
                          <p className={styles.fileName()}>{entry.file.name}</p>
                          <div className={styles.fileMeta()}>
                            <span>{formatFileSize(entry.file.size)}</span>
                            {entry.error ? <span>{entry.error}</span> : null}
                          </div>
                          {status === "uploading" ? (
                            <div
                              className={styles.progressTrack()}
                              aria-hidden="true"
                            >
                              <motion.div
                                className={styles.progressBar()}
                                initial={{ width: "12%" }}
                                animate={{ width: `${progress}%` }}
                                transition={{
                                  duration: 0.45,
                                  ease: smoothEase,
                                }}
                              />
                            </div>
                          ) : null}
                        </div>

                        <span className={styles.status()}>
                          {getStatusLabel(status)}
                        </span>

                        <button
                          type="button"
                          aria-label={`Remove ${entry.file.name}`}
                          className={styles.removeButton()}
                          disabled={disabled}
                          onClick={(event) => {
                            event.stopPropagation();
                            removeFile(entry.id);
                          }}
                        >
                          <X className="size-3.5" aria-hidden="true" />
                        </button>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </motion.ul>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </Elevated>
  );
}

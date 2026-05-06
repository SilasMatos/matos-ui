"use client";

import {
  AnimatePresence,
  type HTMLMotionProps,
  motion,
  useReducedMotion,
} from "framer-motion";
import { AlertCircle, FileText, Upload, X } from "lucide-react";
import {
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  useCallback,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const fileUploadVariants = tv({
  slots: {
    root: [
      "group relative isolate flex cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border p-7 text-center",
      "bg-card text-card-foreground shadow-xs transition-colors duration-300",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    ],
    glow: [
      "pointer-events-none absolute inset-x-6 top-0 -z-10 h-px opacity-0 transition-opacity duration-300",
      "bg-gradient-to-r from-transparent via-primary/50 to-transparent",
    ],
    icon: [
      "relative flex items-center justify-center rounded-full border p-2.5",
      "bg-background text-muted-foreground shadow-xs transition-colors duration-300",
    ],
    title: "text-sm font-medium leading-none",
    description: "text-xs leading-5 text-muted-foreground",
    fileList: "mt-3 flex w-full flex-col gap-2",
    fileItem: [
      "group/file flex items-center gap-3 rounded-xl border px-3 py-2 text-sm",
      "border-border bg-card shadow-xs transition-colors duration-200",
    ],
    fileName: "flex-1 truncate text-left text-sm text-foreground",
    fileSize: "shrink-0 text-xs text-muted-foreground",
    removeButton: [
      "inline-flex size-6 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors",
      "hover:bg-destructive/10 hover:text-destructive",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    ],
    errorText: "flex items-center gap-1.5 text-xs text-destructive",
  },
  variants: {
    variant: {
      default: {
        root: "border-border hover:border-primary/30 hover:bg-muted/20",
        icon: "border-border group-hover:border-primary/25 group-hover:text-primary",
      },
      outline: {
        root: "border-border bg-transparent hover:border-primary/30 hover:bg-muted/15",
        icon: "border-border",
      },
      ghost: {
        root: "border-transparent bg-muted/15 hover:bg-muted/25",
        icon: "border-transparent bg-transparent shadow-none",
      },
    },
    size: {
      sm: {
        root: "gap-2 p-5",
        icon: "p-2 [&_svg]:size-4",
        title: "text-xs",
        description: "text-[11px]",
      },
      md: {
        root: "gap-3 p-7",
        icon: "p-2.5 [&_svg]:size-5",
        title: "text-sm",
        description: "text-xs",
      },
      lg: {
        root: "gap-3.5 p-10",
        icon: "p-3 [&_svg]:size-6",
        title: "text-base",
        description: "text-sm",
      },
    },
    isDragging: {
      true: {},
      false: {},
    },
    disabled: {
      true: {
        root: "pointer-events-none opacity-50",
      },
      false: {},
    },
  },
  compoundVariants: [
    {
      variant: "default",
      isDragging: true,
      class: {
        root: "border-primary/45 bg-primary/5",
        glow: "opacity-100",
        icon: "border-primary/30 bg-primary/10 text-primary",
      },
    },
    {
      variant: "outline",
      isDragging: true,
      class: {
        root: "border-primary/45 bg-primary/5",
        glow: "opacity-100",
        icon: "border-primary/30 bg-primary/10 text-primary",
      },
    },
    {
      variant: "ghost",
      isDragging: true,
      class: {
        root: "bg-primary/5",
        glow: "opacity-100",
        icon: "bg-primary/10 text-primary",
      },
    },
  ],
  defaultVariants: {
    variant: "default",
    size: "md",
    isDragging: false,
    disabled: false,
  },
});

export interface FileUploadFile {
  file: File;
  id: string;
  error?: string;
}

export type FileUploadProps = Omit<
  HTMLMotionProps<"div">,
  "children" | "onChange"
> &
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
  };

const smoothEase = [0.22, 1, 0.36, 1] as const;
const listSpring = {
  type: "spring",
  stiffness: 320,
  damping: 30,
  mass: 0.82,
} as const;

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function FileUpload({
  className,
  variant = "default",
  size = "md",
  accept,
  multiple = false,
  maxSize,
  maxFiles,
  files: controlledFiles,
  onFilesChange,
  title: titleText,
  description: descriptionText,
  disabled = false,
  ...props
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [dragging, setDragging] = useState(false);
  const [internalFiles, setInternalFiles] = useState<FileUploadFile[]>([]);

  const isControlled = controlledFiles !== undefined;
  const files = isControlled ? controlledFiles : internalFiles;

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
        return `Arquivo excede ${formatFileSize(maxSize)}`;
      }

      return undefined;
    },
    [maxSize],
  );

  const addFiles = useCallback(
    (incoming: File[]) => {
      if (disabled) {
        return;
      }

      const newEntries: FileUploadFile[] = incoming.map((file) => ({
        file,
        id: generateId(),
        error: validateFile(file),
      }));

      let nextFiles: FileUploadFile[];

      if (multiple) {
        nextFiles = [...files, ...newEntries];

        if (maxFiles && nextFiles.length > maxFiles) {
          nextFiles = nextFiles.slice(0, maxFiles);
        }
      } else {
        nextFiles = newEntries.slice(0, 1);
      }

      updateFiles(nextFiles);
    },
    [disabled, files, multiple, maxFiles, validateFile, updateFiles],
  );

  const removeFile = useCallback(
    (id: string) => {
      updateFiles(files.filter((file) => file.id !== id));
    },
    [files, updateFiles],
  );

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
    setDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setDragging(false);

      if (event.dataTransfer?.files) {
        addFiles(Array.from(event.dataTransfer.files));
      }
    },
    [addFiles],
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
        addFiles(Array.from(event.target.files));
      }

      event.target.value = "";
    },
    [addFiles],
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleClick();
      }
    },
    [handleClick],
  );

  const styles = fileUploadVariants({
    variant,
    size,
    isDragging: dragging,
    disabled,
  });

  const defaultTitle = dragging
    ? "Solte os arquivos aqui"
    : "Arraste seus arquivos";

  const defaultDescription = multiple
    ? "ou clique para selecionar varios arquivos"
    : "ou clique para selecionar um arquivo";

  return (
    <div data-slot="file-upload" className="w-full">
      <motion.div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Area de upload de arquivos"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={twMerge(styles.root(), className)}
        animate={
          shouldReduceMotion
            ? undefined
            : {
                scale: dragging ? 1.01 : 1,
                y: dragging ? -2 : 0,
                boxShadow: dragging
                  ? "0 18px 42px color-mix(in oklch, var(--primary) 13%, transparent)"
                  : "0 1px 2px color-mix(in oklch, var(--foreground) 8%, transparent)",
              }
        }
        whileTap={shouldReduceMotion || disabled ? undefined : { scale: 0.995 }}
        transition={{ duration: 0.24, ease: smoothEase }}
        {...props}
      >
        <span className={styles.glow()} aria-hidden="true" />

        <motion.span
          className={styles.icon()}
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  y: dragging ? -1 : 0,
                  scale: dragging ? 1.04 : 1,
                }
          }
          transition={{ duration: 0.28, ease: smoothEase }}
        >
          <Upload aria-hidden="true" />
        </motion.span>

        <div className="flex flex-col gap-1">
          <span className={styles.title()}>{titleText ?? defaultTitle}</span>
          <span className={styles.description()}>
            {descriptionText ?? defaultDescription}
          </span>
        </div>

        {accept && (
          <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] text-muted-foreground/70">
            {accept}
          </span>
        )}
      </motion.div>

      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        tabIndex={-1}
        aria-hidden="true"
      />

      <AnimatePresence initial={false}>
        {files.length > 0 && (
          <motion.ul
            className={styles.fileList()}
            data-slot="file-upload-list"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: smoothEase }}
          >
            <AnimatePresence initial={false}>
              {files.map((entry) => (
                <motion.li
                  key={entry.id}
                  layout
                  className={styles.fileItem()}
                  initial={
                    shouldReduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, y: 8, scale: 0.985 }
                  }
                  animate={
                    shouldReduceMotion
                      ? { opacity: 1 }
                      : { opacity: 1, y: 0, scale: 1 }
                  }
                  exit={
                    shouldReduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, x: 10, scale: 0.985 }
                  }
                  transition={listSpring}
                >
                  <FileText
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />

                  <span className={styles.fileName()}>{entry.file.name}</span>

                  <span className={styles.fileSize()}>
                    {formatFileSize(entry.file.size)}
                  </span>

                  {entry.error && (
                    <span className={styles.errorText()}>
                      <AlertCircle className="size-3.5" aria-hidden="true" />
                      {entry.error}
                    </span>
                  )}

                  <button
                    type="button"
                    aria-label={`Remover ${entry.file.name}`}
                    className={styles.removeButton()}
                    onClick={(event) => {
                      event.stopPropagation();
                      removeFile(entry.id);
                    }}
                  >
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

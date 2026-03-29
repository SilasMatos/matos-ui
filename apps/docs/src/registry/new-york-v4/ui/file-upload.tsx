"use client";

import { AlertCircle, FileText, Upload, X } from "lucide-react";
import {
  type ChangeEvent,
  type ComponentProps,
  type DragEvent,
  useCallback,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

/* ------------------------------------------------------------------ */
/*  Variantes                                                          */
/* ------------------------------------------------------------------ */

export const fileUploadVariants = tv({
  slots: {
    root: [
      "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 cursor-pointer",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    ],
    icon: "flex items-center justify-center rounded-lg p-2.5 transition-colors duration-200",
    title: "text-sm font-medium leading-none",
    description: "text-xs text-muted-foreground",
    fileList: "mt-3 flex w-full flex-col gap-2",
    fileItem: [
      "group flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors duration-150",
      "border-border bg-background",
    ],
    fileName: "flex-1 truncate text-left text-sm text-foreground",
    fileSize: "shrink-0 text-xs text-muted-foreground",
    removeButton: [
      "inline-flex size-5 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors",
      "hover:bg-destructive/10 hover:text-destructive",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    ],
    errorText: "flex items-center gap-1.5 text-xs text-destructive",
  },

  variants: {
    variant: {
      default: {
        root: "border-border bg-muted/30 hover:border-primary/40 hover:bg-muted/50",
        icon: "bg-primary/10 text-primary",
      },
      outline: {
        root: "border-border bg-transparent hover:border-primary/40 hover:bg-muted/20",
        icon: "bg-muted text-muted-foreground",
      },
      ghost: {
        root: "border-transparent bg-muted/20 hover:bg-muted/40",
        icon: "bg-transparent text-muted-foreground",
      },
    },
    size: {
      sm: {
        root: "gap-2 p-5",
        icon: "p-1.5 [&_svg]:size-4",
        title: "text-xs",
        description: "text-[11px]",
      },
      md: {
        root: "gap-3 p-8",
        icon: "p-2.5 [&_svg]:size-5",
        title: "text-sm",
        description: "text-xs",
      },
      lg: {
        root: "gap-4 p-12",
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
        root: "border-primary bg-primary/5",
        icon: "bg-primary/20 text-primary",
      },
    },
    {
      variant: "outline",
      isDragging: true,
      class: {
        root: "border-primary bg-primary/5",
        icon: "bg-primary/10 text-primary",
      },
    },
    {
      variant: "ghost",
      isDragging: true,
      class: {
        root: "bg-primary/5",
        icon: "text-primary",
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

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface FileUploadFile {
  file: File;
  id: string;
  error?: string;
}

export type FileUploadProps = Omit<
  ComponentProps<"div">,
  "onChange" | "children"
> &
  VariantProps<typeof fileUploadVariants> & {
    /** Accepted MIME types (e.g. "image/*,.pdf") */
    accept?: string;
    /** Allow selecting multiple files */
    multiple?: boolean;
    /** Maximum file size in bytes */
    maxSize?: number;
    /** Maximum number of files */
    maxFiles?: number;
    /** Currently selected files (controlled) */
    files?: FileUploadFile[];
    /** Callback when files change */
    onFilesChange?: (files: FileUploadFile[]) => void;
    /** Custom placeholder title */
    title?: string;
    /** Custom placeholder description */
    description?: string;
    /** Whether the upload zone is disabled */
    disabled?: boolean;
  };

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

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
      if (disabled) return;

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
      updateFiles(files.filter((f) => f.id !== id));
    },
    [files, updateFiles],
  );

  /* — Drag events — */
  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setDragging(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
      if (e.dataTransfer?.files) {
        addFiles(Array.from(e.dataTransfer.files));
      }
    },
    [addFiles],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        addFiles(Array.from(e.target.files));
      }
      e.target.value = "";
    },
    [addFiles],
  );

  const handleClick = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick],
  );

  /* — Styles — */
  const styles = fileUploadVariants({
    variant,
    size,
    isDragging: dragging,
    disabled,
  });

  const defaultTitle = dragging
    ? "Solte os arquivos aqui"
    : "Arraste e solte seus arquivos";

  const defaultDescription = multiple
    ? "ou clique para selecionar vários arquivos"
    : "ou clique para selecionar um arquivo";

  return (
    <div data-slot="file-upload" className="w-full">
      {/* — Drop zone — */}
      {/* biome-ignore lint/a11y/useSemanticElements: Esta div atua como um dropzone complexo */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Área de upload de arquivos"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={twMerge(styles.root(), className)}
        {...props}
      >
        <span className={styles.icon()}>
          <Upload aria-hidden="true" />
        </span>

        <div className="flex flex-col gap-1">
          <span className={styles.title()}>{titleText ?? defaultTitle}</span>
          <span className={styles.description()}>
            {descriptionText ?? defaultDescription}
          </span>
        </div>

        {accept && (
          <span className="text-[10px] text-muted-foreground/60">{accept}</span>
        )}
      </div>

      {/* — Hidden input — */}
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

      {/* — File list — */}
      {files.length > 0 && (
        <ul className={styles.fileList()} data-slot="file-upload-list">
          {files.map((entry) => (
            <li key={entry.id} className={styles.fileItem()}>
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
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(entry.id);
                }}
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

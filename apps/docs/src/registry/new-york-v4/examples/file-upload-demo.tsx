"use client";

import { useState } from "react";
import {
  FileUpload,
  type FileUploadFile,
} from "@/registry/new-york-v4/ui/file-upload";

function createDemoFile(
  name: string,
  size: number,
  type: string,
  status: FileUploadFile["status"],
  progress?: number,
  error?: string,
): FileUploadFile {
  return {
    id: name,
    file: new File([new Uint8Array(size)], name, {
      type,
      lastModified: Date.now(),
    }),
    status,
    progress,
    error,
  };
}

export default function FileUploadDemo() {
  const [singleFiles, setSingleFiles] = useState<FileUploadFile[]>([]);
  const [multiFiles, setMultiFiles] = useState<FileUploadFile[]>([]);
  const [reviewFiles, setReviewFiles] = useState<FileUploadFile[]>(() => [
    createDemoFile(
      "product-roadmap.pdf",
      420_000,
      "application/pdf",
      "success",
    ),
    createDemoFile("customer-import.csv", 180_000, "text/csv", "uploading", 58),
    createDemoFile(
      "brand-video.mov",
      9_800_000,
      "video/quicktime",
      "error",
      undefined,
      "Larger than 5 MB",
    ),
  ]);

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-4">
      <section className="grid gap-3 md:grid-cols-[1fr_1.1fr]">
        <FileUpload
          files={singleFiles}
          onFilesChange={setSingleFiles}
          accept="image/*,.pdf"
          maxSize={5 * 1024 * 1024}
          title="Upload asset"
          description="Images or PDF up to 5 MB"
        />

        <FileUpload
          variant="outline"
          multiple
          maxFiles={5}
          files={multiFiles}
          onFilesChange={setMultiFiles}
          title="Attach files"
          description="Add up to 5 workspace files"
        />
      </section>

      <FileUpload
        multiple
        maxFiles={4}
        maxSize={5 * 1024 * 1024}
        files={reviewFiles}
        onFilesChange={setReviewFiles}
        state="uploading"
        title="Review queue"
        description="Compact feedback for files already added"
        accept=".pdf,.csv,.png"
      />

      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <FileUpload
          size="sm"
          title="Default"
          description="Inset surface"
          accept=".pdf"
        />
        <FileUpload
          variant="outline"
          size="sm"
          title="Outline"
          description="Clear border"
          accept=".csv"
        />
        <FileUpload
          variant="ghost"
          size="sm"
          title="Ghost"
          description="Quiet upload"
          accept=".png"
        />
      </section>
    </div>
  );
}

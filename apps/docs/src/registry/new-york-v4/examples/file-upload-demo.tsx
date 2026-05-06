"use client";

import { useState } from "react";
import type { FileUploadFile } from "@/registry/new-york-v4/ui/file-upload";
import { FileUpload } from "@/registry/new-york-v4/ui/file-upload";

export default function FileUploadDemo() {
  const [singleFiles, setSingleFiles] = useState<FileUploadFile[]>([]);
  const [multiFiles, setMultiFiles] = useState<FileUploadFile[]>([]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Single file
          </p>
          <h3 className="text-sm font-medium">Quiet upload surface</h3>
        </div>
        <FileUpload
          files={singleFiles}
          onFilesChange={setSingleFiles}
          accept="image/*,.pdf"
          maxSize={5 * 1024 * 1024}
          title="Drop your file"
          description="Images or PDF up to 5 MB"
        />
      </section>

      <section className="flex flex-col gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Multiple files
          </p>
          <h3 className="text-sm font-medium">Stacked file feedback</h3>
        </div>
        <FileUpload
          variant="outline"
          multiple
          maxFiles={5}
          files={multiFiles}
          onFilesChange={setMultiFiles}
          title="Drop up to 5 files"
          description="The list animates as files are added or removed"
        />
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <FileUpload size="sm" title="Default" description="Minimal" />
        <FileUpload
          variant="outline"
          size="sm"
          title="Outline"
          description="Subtle border"
        />
        <FileUpload
          variant="ghost"
          size="sm"
          title="Ghost"
          description="Soft surface"
        />
      </section>
    </div>
  );
}

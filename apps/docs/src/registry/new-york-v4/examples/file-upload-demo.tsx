"use client";

import { useState } from "react";
import type { FileUploadFile } from "@/registry/new-york-v4/ui/file-upload";
import { FileUpload } from "@/registry/new-york-v4/ui/file-upload";

export default function FileUploadDemo() {
  const [singleFiles, setSingleFiles] = useState<FileUploadFile[]>([]);
  const [multiFiles, setMultiFiles] = useState<FileUploadFile[]>([]);

  return (
    <div className="flex flex-col gap-10">
      {/* — Default — */}
      <section className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Upload simples
        </p>
        <FileUpload
          files={singleFiles}
          onFilesChange={setSingleFiles}
          accept="image/*,.pdf"
          maxSize={5 * 1024 * 1024}
        />
      </section>

      {/* — Múltiplos arquivos — */}
      <section className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Múltiplos arquivos
        </p>
        <FileUpload
          variant="outline"
          multiple
          maxFiles={5}
          files={multiFiles}
          onFilesChange={setMultiFiles}
          title="Envie até 5 arquivos"
          description="Arraste ou clique para selecionar"
        />
      </section>

      {/* — Variantes — */}
      <section className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Variantes
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FileUpload size="sm" title="Default" description="Pequeno" />
          <FileUpload
            variant="outline"
            size="sm"
            title="Outline"
            description="Pequeno"
          />
          <FileUpload
            variant="ghost"
            size="sm"
            title="Ghost"
            description="Pequeno"
          />
        </div>
      </section>

      {/* — Desabilitado — */}
      <section className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Desabilitado
        </p>
        <FileUpload disabled size="sm" />
      </section>
    </div>
  );
}

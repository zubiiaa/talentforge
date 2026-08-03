"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2, Upload } from "lucide-react";
import { uploadProfileFile } from "@/server/actions/profile";
import { Button } from "@/components/ui/button";

export function UploadButton({
  target,
  label,
  accept,
  onUploaded,
}: {
  target: "avatar" | "cover" | "resume";
  label: string;
  accept: string;
  onUploaded?: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File) {
    setError(null);
    const formData = new FormData();
    formData.set("target", target);
    formData.set("file", file);
    startTransition(async () => {
      const res = await uploadProfileFile(formData);
      if (res.error) setError(res.error);
      else if (res.url) onUploaded?.(res.url);
    });
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
      >
        {pending ? <Loader2 className="animate-spin" /> : <Upload />}
        {label}
      </Button>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  X,
  Eye,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface UploadedDocState {
  file: File | null;
  fileName: string;
  fileSize: string;
  fileUrl?: string | undefined;
  documentNumber: string;
}

interface DocumentUploadCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  required?: boolean;
  docNumberLabel?: string;
  docNumberPlaceholder?: string;
  state: UploadedDocState;
  onChange: (updated: UploadedDocState) => void;
  onPreview?: ((url: string, title: string) => void) | undefined;
}

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function DocumentUploadCard({
  title,
  description,
  icon,
  required = true,
  docNumberLabel = "Document Number",
  docNumberPlaceholder = "e.g. 27AAAAA0000A1Z5",
  state,
  onChange,
  onPreview,
}: DocumentUploadCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setError(null);
    const validTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|png|jpe?g|webp)$/i)) {
      setError("Please upload a PDF, PNG, JPG, or WEBP file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10 MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      onChange({
        ...state,
        file,
        fileName: file.name,
        fileSize: formatBytes(file.size),
        fileUrl: dataUrl,
      });
    };
    reader.readAsDataURL(file);
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function onDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }

  function onFileInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }

  function removeFile() {
    setError(null);
    onChange({
      ...state,
      file: null,
      fileName: "",
      fileSize: "",
      fileUrl: undefined,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const isUploaded = Boolean(state.fileName);

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all p-4.5 bg-card/60 space-y-3.5",
        isUploaded ? "border-success/40 bg-success/5" : "border-border hover:border-primary/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "grid size-9 place-items-center rounded-xl",
              isUploaded ? "bg-success/20 text-success" : "bg-primary/10 text-primary",
            )}
          >
            {icon || <FileText className="size-4.5" />}
          </div>
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-1.5 leading-tight">
              {title}
              {required ? (
                <span className="text-destructive text-xs font-normal">*Required</span>
              ) : (
                <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
              )}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>
        {isUploaded && (
          <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success">
            <CheckCircle2 className="size-3.5" />
            Uploaded
          </span>
        )}
      </div>

      {/* Document Number Input */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">
          {docNumberLabel} {required && <span className="text-destructive">*</span>}
        </Label>
        <Input
          value={state.documentNumber}
          onChange={(e) => onChange({ ...state, documentNumber: e.target.value.toUpperCase() })}
          placeholder={docNumberPlaceholder}
          className="h-10 text-xs font-mono uppercase bg-background"
        />
      </div>

      {/* Dropzone or Uploaded File Card */}
      {!isUploaded ? (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center cursor-pointer transition-colors duration-200",
            isDragging
              ? "border-primary bg-primary/10"
              : "border-muted-foreground/30 hover:border-primary/50 hover:bg-accent/40",
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={onFileInputChange}
          />
          <UploadCloud className="size-6 text-muted-foreground mb-1.5" />
          <p className="text-xs font-medium text-foreground">
            Click to upload or drag & drop file
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            PDF, PNG, JPG or WEBP (Max 10 MB)
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 rounded-xl border bg-background/80 p-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileCheck className="size-5 text-success shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium truncate text-foreground">{state.fileName}</p>
              <p className="text-[11px] text-muted-foreground">{state.fileSize}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {state.fileUrl && onPreview && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg"
                onClick={() => onPreview(state.fileUrl!, `${title} Preview`)}
                title="Preview Document"
              >
                <Eye className="size-4 text-muted-foreground" />
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg text-destructive hover:bg-destructive/10"
              onClick={removeFile}
              title="Remove File"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="size-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

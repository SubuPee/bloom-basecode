import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, FileText } from "lucide-react";

interface DocumentPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  fileUrl?: string | undefined;
  fileName?: string | undefined;
  documentNumber?: string | undefined;
}

export function DocumentPreviewDialog({
  open,
  onOpenChange,
  title,
  fileUrl,
  fileName = "document",
  documentNumber,
}: DocumentPreviewDialogProps) {
  const isImage = fileUrl?.startsWith("data:image/") || fileName.match(/\.(png|jpe?g|webp)$/i);
  const isPdf = fileUrl?.startsWith("data:application/pdf") || fileName.endsWith(".pdf");

  function handleDownload() {
    if (!fileUrl) return;
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function handleOpenNewTab() {
    if (!fileUrl) return;
    const win = window.open();
    if (win) {
      if (isImage) {
        win.document.write(`<img src="${fileUrl}" style="max-width:100%;height:auto;margin:auto;display:block;" />`);
      } else if (isPdf) {
        win.document.write(`<iframe src="${fileUrl}" frameborder="0" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;" allowfullscreen></iframe>`);
      } else {
        win.location.href = fileUrl;
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-3xl p-6">
        <DialogHeader className="pb-2 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
              {documentNumber && (
                <p className="text-xs font-mono text-muted-foreground mt-0.5">
                  Doc Number: {documentNumber}
                </p>
              )}
            </div>
            {fileUrl && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={handleOpenNewTab}
                >
                  <ExternalLink className="size-3.5 mr-1" />
                  New Tab
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={handleDownload}
                >
                  <Download className="size-3.5 mr-1" />
                  Download
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex items-center justify-center p-4 min-h-[320px] max-h-[500px] overflow-auto rounded-2xl bg-muted/30 border">
          {fileUrl && isImage ? (
            <img
              src={fileUrl}
              alt={title}
              className="max-h-[460px] max-w-full rounded-lg object-contain shadow-sm"
            />
          ) : fileUrl && isPdf ? (
            <iframe
              src={fileUrl}
              title={title}
              className="w-full h-[460px] rounded-lg border-0"
            />
          ) : (
            <div className="text-center space-y-3 p-8">
              <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary mx-auto">
                <FileText className="size-7" />
              </div>
              <p className="text-sm font-medium text-foreground">{fileName}</p>
              <p className="text-xs text-muted-foreground">
                Document attached and verified in vendor compliance vault.
              </p>
              {fileUrl && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-full text-xs"
                  onClick={handleDownload}
                >
                  <Download className="size-3.5 mr-1" />
                  Download Attachment
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

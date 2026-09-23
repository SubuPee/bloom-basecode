import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, FileText } from "lucide-react";
import {
  DocumentUploadCard,
  type UploadedDocState,
} from "./document-upload-card";
import { DocumentPreviewDialog } from "./document-preview-dialog";
import {
  vendorStore,
  type Vendor,
  type VendorDocument,
} from "@/lib/bloom-vendor-store";
import { toast } from "sonner";

interface VendorUploadDocDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: Vendor | null;
  defaultType?: VendorDocument["type"] | undefined;
  onSuccess?: () => void;
}

const initialDocState: UploadedDocState = {
  file: null,
  fileName: "",
  fileSize: "",
  fileUrl: undefined,
  documentNumber: "",
};

export function VendorUploadDocDialog({
  open,
  onOpenChange,
  vendor,
  defaultType = "GST Certificate",
  onSuccess,
}: VendorUploadDocDialogProps) {
  const [docType, setDocType] = useState<VendorDocument["type"]>(defaultType);
  const [docState, setDocState] = useState<UploadedDocState>(initialDocState);
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [previewTitle, setPreviewTitle] = useState("");

  function openPreview(url: string, title: string) {
    setPreviewUrl(url);
    setPreviewTitle(title);
    setPreviewOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vendor) return;

    if (!docState.fileName) {
      toast.error("Please upload a document file.");
      return;
    }

    if (!docState.documentNumber.trim()) {
      toast.error("Please enter the document number.");
      return;
    }

    setIsSubmitting(true);

    vendorStore.addDocumentToVendor(vendor.id, {
      type: docType,
      documentNumber: docState.documentNumber.trim(),
      fileName: docState.fileName,
      fileSize: docState.fileSize,
      fileUrl: docState.fileUrl,
      expiryDate: expiryDate || undefined,
      notes: notes || undefined,
      status: "Pending",
      file: docState.file,
    });

    toast.success(`${docType} uploaded successfully for ${vendor.businessName}!`);
    setIsSubmitting(false);
    setDocState(initialDocState);
    setExpiryDate("");
    setNotes("");
    onOpenChange(false);
    if (onSuccess) onSuccess();
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl rounded-3xl p-6 sm:p-7">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                <UploadCloud className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">
                  Upload Compliance Document
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Attach official verification document for <strong className="text-foreground">{vendor?.businessName}</strong> ({vendor?.id}).
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Document Type</Label>
              <select
                value={docType}
                onChange={(e) => {
                  const val = e.target.value as VendorDocument["type"];
                  setDocType(val);
                  // Pre-fill document number if vendor has it
                  if (val === "GST Certificate" && vendor?.taxInfo.gstNumber) {
                    setDocState((prev) => ({ ...prev, documentNumber: vendor.taxInfo.gstNumber }));
                  } else if (val === "PAN Card" && vendor?.taxInfo.panNumber) {
                    setDocState((prev) => ({ ...prev, documentNumber: vendor.taxInfo.panNumber }));
                  }
                }}
                className="h-10 w-full rounded-xl border bg-background px-3 text-sm font-medium"
              >
                <option value="GST Certificate">GST Certificate</option>
                <option value="PAN Card">PAN Card</option>
                <option value="Address Proof">Address Proof</option>
                <option value="Bank Proof">Bank Proof (Cancelled Cheque)</option>
                <option value="Business Registration">Business Registration / MSME / Udyam</option>
                <option value="Owner ID">Owner ID / Passport / Aadhaar</option>
                <option value="Other">Other Compliance Document</option>
              </select>
            </div>

            <DocumentUploadCard
              title={docType}
              description={`Attach digital scan or PDF copy of ${docType}`}
              docNumberLabel={`${docType} Number / ID`}
              docNumberPlaceholder={
                docType === "GST Certificate"
                  ? "e.g. 27AAACA1234A1Z5"
                  : docType === "PAN Card"
                    ? "e.g. AAACA1234A"
                    : "e.g. DOC-987654"
              }
              required
              state={docState}
              onChange={setDocState}
              onPreview={openPreview}
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Expiry Date (If applicable)</Label>
                <Input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Verification Note / Remarks</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Validated against GST portal"
                  className="h-10 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                className="rounded-full"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full px-6"
                disabled={isSubmitting || !docState.fileName}
              >
                {isSubmitting ? "Uploading..." : "Save & Attach Document"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DocumentPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title={previewTitle}
        fileUrl={previewUrl}
      />
    </>
  );
}

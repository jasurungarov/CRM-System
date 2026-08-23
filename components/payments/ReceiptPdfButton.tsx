"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getReceiptData } from "@/actions/payments.actions";
import { downloadReceiptPdf } from "@/lib/pdf/receipt";

export function ReceiptPdfButton({ paymentId }: { paymentId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        const data = await getReceiptData(paymentId);
        downloadReceiptPdf(data);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Chekni yuklab bo'lmadi");
      }
    });
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleClick} disabled={isPending} aria-label="PDF chek">
      <FileDown className="h-4 w-4" />
    </Button>
  );
}

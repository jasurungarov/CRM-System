"use client";

import { Button } from "@/components/ui/button";
import { downloadContractPdf, type ContractPdfData } from "@/lib/pdf/contract";
import { FileDown } from "lucide-react";

export function DownloadContractButton({ data }: { data: ContractPdfData }) {
  return (
    <Button variant="outline" className="w-full" onClick={() => downloadContractPdf(data)}>
      <FileDown className="h-4 w-4" />
      Shartnomani PDF holida yuklab olish
    </Button>
  );
}

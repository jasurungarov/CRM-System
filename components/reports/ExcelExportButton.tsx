"use client";

import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export function ExcelExportButton({
  label,
  fileName,
  sheetName,
  fetchData,
}: {
  label: string;
  fileName: string;
  sheetName: string;
  fetchData: () => Promise<Record<string, unknown>[]>;
}) {
  const tReports = useTranslations("reports");
  const tCommon = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        const data = await fetchData();
        if (data.length === 0) {
          toast.error(tReports("noDataToExport"));
          return;
        }
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : tReports("exportError"),
        );
      }
    });
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleClick}
      disabled={isPending}>
      <FileSpreadsheet className="h-4 w-4" />
      {isPending ? tCommon("loading") : label}
    </Button>
  );
}

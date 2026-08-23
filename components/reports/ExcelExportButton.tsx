"use client";

import { useTransition } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        const data = await fetchData();
        if (data.length === 0) {
          toast.error("Eksport qilish uchun ma'lumot topilmadi");
          return;
        }
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Eksport qilishda xatolik");
      }
    });
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleClick} disabled={isPending}>
      <FileSpreadsheet className="h-4 w-4" />
      {isPending ? "..." : label}
    </Button>
  );
}

"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";
import { uploadDocumentAction, type UploadDocumentState } from "@/actions/documents.actions";

function StatusLabel() {
  const { pending } = useFormStatus();
  const tDocs = useTranslations("documents");
  const tCommon = useTranslations("common");

  if (pending) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        {tCommon("loading")}
      </span>
    );
  }
  return (
    <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-primary hover:underline">
      <Upload className="h-3.5 w-3.5" />
      {tDocs("uploadLabel")}
      <input type="file" name="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" />
    </label>
  );
}

export function UploadDocumentButton({ clientId, documentId }: { clientId: string; documentId: string }) {
  const tDocs = useTranslations("documents");
  const [state, formAction] = useActionState<UploadDocumentState, FormData>(uploadDocumentAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) toast.success(tDocs("statusAccepted"));
    if (state.error) toast.error(state.error);
  }, [state.success, state.error, tDocs]);

  return (
    <form
      ref={formRef}
      action={formAction}
      onChange={(e) => {
        const input = e.currentTarget.elements.namedItem("file") as HTMLInputElement | null;
        if (input?.files?.length) e.currentTarget.requestSubmit();
      }}
    >
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="documentId" value={documentId} />
      <StatusLabel />
    </form>
  );
}
"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addCustomDocumentAction } from "@/actions/documents.actions";

export function AddCustomDocumentButton({ clientId }: { clientId: string }) {
  const tDocs = useTranslations("documents");
  const tCommon = useTranslations("common");

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!title.trim()) {
      toast.error(tDocs("docNameRequired"));
      return;
    }
    startTransition(async () => {
      try {
        await addCustomDocumentAction(clientId, title, description);
        toast.success(tDocs("added"));
        setOpen(false);
        setTitle("");
        setDescription("");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : tCommon("errorOccurred"));
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <Plus className="h-4 w-4" />
          {tDocs("addCustom")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tDocs("addCustomTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="customDocTitle">{tDocs("docName")}</Label>
            <Input
              id="customDocTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customDocDescription">
              {tCommon("note")} {tDocs("optionalTag")}
            </Label>
            <Input
              id="customDocDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{tCommon("cancel")}</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? tCommon("loading") : tCommon("add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
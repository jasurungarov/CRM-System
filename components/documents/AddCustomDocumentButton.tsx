"use client";

import { useState, useTransition } from "react";
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
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!title.trim()) {
      toast.error("Hujjat nomini kiriting");
      return;
    }
    startTransition(async () => {
      try {
        await addCustomDocumentAction(clientId, title, description);
        toast.success("Hujjat qo'shildi");
        setOpen(false);
        setTitle("");
        setDescription("");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Xatolik yuz berdi");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <Plus className="h-4 w-4" />
          Qo&apos;shimcha hujjat
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Qo&apos;shimcha hujjat qo&apos;shish</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="customDocTitle">Hujjat nomi</Label>
            <Input id="customDocTitle" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customDocDescription">Izoh (ixtiyoriy)</Label>
            <Input
              id="customDocDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Bekor qilish</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "..." : "Qo'shish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

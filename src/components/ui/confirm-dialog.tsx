"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

/** Confirmation for sensitive operations. The action runs only on an explicit click; Escape/overlay cancel. */
export function ConfirmDialog({
  open, onOpenChange, title, description, confirmLabel, danger, pending, onConfirm,
}: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; description: string;
  confirmLabel: string; danger?: boolean; pending?: boolean; onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!pending) onOpenChange(o); }}>
      <DialogContent title={title} description={description}>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>Cancel</Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} disabled={pending}>
            {pending ? "Working…" : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

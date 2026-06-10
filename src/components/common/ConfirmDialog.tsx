import { useState, type ReactNode } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  trigger: ReactNode;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({ trigger, title, description, confirmLabel = "Confirmar", destructive, onConfirm }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    try { await onConfirm(); setOpen(false); setText(""); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setText(""); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription asChild><div>{description}</div></DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label className="text-xs">Para prosseguir, digite <span className="font-mono text-foreground">CONFIRMAR</span></Label>
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="CONFIRMAR" autoFocus />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            onClick={handle}
            disabled={text !== "CONFIRMAR" || loading}
            className={destructive ? "bg-bear text-foreground hover:bg-bear/90" : ""}
          >
            {loading ? "Processando..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

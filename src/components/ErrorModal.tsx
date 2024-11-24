import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  error: string;
}

export function ErrorModal({ isOpen, onClose, title, error }: ErrorModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-red-500">{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-400 whitespace-pre-wrap">{error}</p>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

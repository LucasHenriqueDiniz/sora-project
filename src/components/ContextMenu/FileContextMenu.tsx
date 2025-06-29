import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "../ui/context-menu";
import { Pencil, Trash, Copy } from "lucide-react";

interface FileContextMenuProps {
  children: React.ReactNode;
  onRename: (newName: string) => Promise<void> | void;
  onDelete: () => Promise<void> | void;
  onDuplicate: () => void;
}

export function FileContextMenu({ children, onRename, onDelete, onDuplicate }: FileContextMenuProps) {
  const handleRename = () => {
    const newName = prompt("Enter new name:");
    if (newName) {
      onRename(newName);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem
          onClick={handleRename}
          className="flex items-center gap-2"
        >
          <Pencil className="h-4 w-4" />
          <span>Rename</span>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={onDuplicate}
          className="flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          <span>Duplicate</span>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={onDelete}
          className="flex items-center gap-2 text-red-400"
        >
          <Trash className="h-4 w-4" />
          <span>Delete</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

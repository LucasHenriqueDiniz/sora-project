import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "../ui/context-menu";
import { VscEdit, VscTrash, VscCopy } from "react-icons/vsc";

interface FileContextMenuProps {
  children: React.ReactNode;
  onRename: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function FileContextMenu({ children, onRename, onDelete, onDuplicate }: FileContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem
          onClick={onRename}
          className="flex items-center gap-2"
        >
          <VscEdit size={16} />
          <span>Rename</span>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={onDuplicate}
          className="flex items-center gap-2"
        >
          <VscCopy size={16} />
          <span>Duplicate</span>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={onDelete}
          className="flex items-center gap-2 text-red-400"
        >
          <VscTrash size={16} />
          <span>Delete</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

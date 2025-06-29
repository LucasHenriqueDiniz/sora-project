import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "../ui/context-menu";
import { Pencil, Trash, Copy, Scissors, ExternalLink, FolderOpen, FileCode } from "lucide-react";

interface TreeItemContextMenuProps {
  children: React.ReactNode;
  onRename: () => void;
  onDelete: () => void;
  isFolder: boolean;
  path: string;
}

export function TreeItemContextMenu({ children, onRename, onDelete, isFolder, path }: TreeItemContextMenuProps) {
  const handleCopyPath = (fullPath: boolean) => {
    navigator.clipboard.writeText(fullPath ? path : path.split("/").pop() || "");
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem
          onClick={onRename}
          className="flex items-center gap-2"
        >
          <Pencil className="h-4 w-4" />
          <span>Rename</span>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={onDelete}
          className="flex items-center gap-2 text-red-400"
        >
          <Trash className="h-4 w-4" />
          <span>Delete</span>
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem className="flex items-center gap-2">
          <Copy className="h-4 w-4" />
          <span>Copy</span>
        </ContextMenuItem>
        <ContextMenuItem className="flex items-center gap-2">
          <Scissors className="h-4 w-4" />
          <span>Cut</span>
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4" />
          <span>Open in New Window</span>
        </ContextMenuItem>
        <ContextMenuItem className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4" />
          <span>Reveal in File Explorer</span>
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem
          onClick={() => handleCopyPath(false)}
          className="flex items-center gap-2"
        >
          <FileCode className="h-4 w-4" />
          <span>Copy Relative Path</span>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => handleCopyPath(true)}
          className="flex items-center gap-2"
        >
          <FileCode className="h-4 w-4" />
          <span>Copy Full Path</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

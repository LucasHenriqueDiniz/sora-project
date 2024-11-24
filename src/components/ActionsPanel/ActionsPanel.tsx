import { VscClearAll, VscError, VscInfo, VscWarning, VscCheck } from "react-icons/vsc";
import { useActionsStore, ActionType } from "../../stores/actionsStore";
import { formatDistanceToNow } from "date-fns";
import { Button } from "../ui/button";

const getIcon = (type: ActionType) => {
  switch (type) {
    case "error":
      return <VscError className="text-red-500" />;
    case "warning":
      return <VscWarning className="text-yellow-500" />;
    case "success":
      return <VscCheck className="text-green-500" />;
    default:
      return <VscInfo className="text-blue-500" />;
  }
};

export function ActionsPanel() {
  const { actions, clearActions } = useActionsStore();

  return (
    <div className="w-80 h-full bg-editor-bg border-l border-gray-700 flex flex-col">
      <div className="h-10 border-b border-gray-700 flex items-center justify-between px-4">
        <span className="text-sm font-medium">Actions</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={clearActions}
        >
          <VscClearAll size={16} />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {actions.length === 0 ? (
          <div className="p-4 text-sm text-gray-400">No actions</div>
        ) : (
          <div className="divide-y divide-gray-700">
            {actions.map((action) => (
              <div
                key={action.id}
                className="p-2 flex items-start gap-2 hover:bg-gray-800"
              >
                {getIcon(action.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300">{action.message}</p>
                  <p className="text-xs text-gray-500">{formatDistanceToNow(action.timestamp, { addSuffix: true })}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

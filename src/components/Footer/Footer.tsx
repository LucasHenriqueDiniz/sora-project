import { VscError, VscInfo, VscWarning, VscCheck } from "react-icons/vsc";
import { useActionsStore, ActionType } from "../../stores/actionsStore";
import { useProjectDiagnosticsStore } from "../../stores/projectDiagnosticsStore";
import { formatDistanceToNow } from "date-fns";

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

export function Footer() {
  const { actions } = useActionsStore();
  const { errors, warnings } = useProjectDiagnosticsStore();
  const lastAction = actions[0];

  return (
    <div className="h-6 bg-header-bg border-t border-gray-700 flex items-center justify-between px-2 text-xs text-gray-400">
      <div className="flex items-center gap-2">
        {lastAction ? (
          <>
            {getIcon(lastAction.type)}
            <span>{lastAction.message}</span>
          </>
        ) : (
          <span className="flex items-center gap-1">
            <VscCheck className="text-green-500" />
            Ready
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <VscError className="text-red-500" />
          <span>{errors.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <VscWarning className="text-yellow-500" />
          <span>{warnings.length}</span>
        </div>
        <span>{actions.length} actions</span>
      </div>
    </div>
  );
}

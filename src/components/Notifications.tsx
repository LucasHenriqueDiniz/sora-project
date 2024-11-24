import React from "react";
import { VscInfo, VscError, VscWarning } from "react-icons/vsc";

type NotificationType = "info" | "error" | "warning";

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timeout?: number;
}

interface NotificationsProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const getIcon = (type: NotificationType) => {
  switch (type) {
    case "info":
      return <VscInfo className="text-blue-400" />;
    case "error":
      return <VscError className="text-red-400" />;
    case "warning":
      return <VscWarning className="text-yellow-400" />;
  }
};

export const Notifications: React.FC<NotificationsProps> = ({ notifications, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg"
        >
          {getIcon(notification.type)}
          <span className="text-sm">{notification.message}</span>
          <button
            onClick={() => onDismiss(notification.id)}
            className="ml-2 text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

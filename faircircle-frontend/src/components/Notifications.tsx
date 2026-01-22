import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export function Notifications() {
  const { notifications, removeNotification } = useStore();

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-md">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          {...notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

interface NotificationItemProps {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  onClose: () => void;
}

function NotificationItem({ type, title, message, onClose }: NotificationItemProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  };

  const colors = {
    success: 'border-emerald-500/30 bg-emerald-500/10',
    error: 'border-red-500/30 bg-red-500/10',
    warning: 'border-amber-500/30 bg-amber-500/10',
    info: 'border-blue-500/30 bg-blue-500/10',
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-xl animate-slide-in ${colors[type]}`}
    >
      {icons[type]}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-white">{title}</h4>
        <p className="text-sm text-zinc-400 mt-0.5">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

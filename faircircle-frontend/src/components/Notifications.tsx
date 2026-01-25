import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export function Notifications() {
  const { notifications, removeNotification } = useStore();

  return (
    <div className="fixed top-24 right-6 z-50 space-y-3 max-w-sm">
      {notifications.map((notification, index) => (
        <NotificationItem
          key={notification.id}
          {...notification}
          index={index}
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
  index: number;
  onClose: () => void;
}

function NotificationItem({ type, title, message, index, onClose }: NotificationItemProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      icon: <CheckCircle className="w-5 h-5" />,
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
      border: 'border-emerald-500/20',
      bg: 'from-emerald-500/10 to-transparent',
    },
    error: {
      icon: <XCircle className="w-5 h-5" />,
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-400',
      border: 'border-red-500/20',
      bg: 'from-red-500/10 to-transparent',
    },
    warning: {
      icon: <AlertCircle className="w-5 h-5" />,
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
      border: 'border-amber-500/20',
      bg: 'from-amber-500/10 to-transparent',
    },
    info: {
      icon: <Info className="w-5 h-5" />,
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      border: 'border-blue-500/20',
      bg: 'from-blue-500/10 to-transparent',
    },
  };

  const { icon, iconBg, iconColor, border, bg } = config[type];

  return (
    <div
      className={`relative overflow-hidden flex items-start gap-4 p-5 rounded-2xl border ${border} glass-card shadow-2xl shadow-black/20 animate-slide-in`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r ${bg} pointer-events-none`} />
      
      {/* Content */}
      <div className="relative z-10 flex items-start gap-4 w-full">
        <div className={`p-2 rounded-xl ${iconBg} ${iconColor} flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-white text-sm">{title}</h4>
          <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-white transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800/50">
        <div 
          className={`h-full ${iconColor.replace('text-', 'bg-')} opacity-50`}
          style={{
            animation: 'shrink 5s linear forwards',
          }}
        />
      </div>
      
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

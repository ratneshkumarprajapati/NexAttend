import { Bell } from 'lucide-react';

export function NotificationsSection() {
  return (
    <div className="glass rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Bell className="w-5 h-5" />
        Notifications
      </h3>
      <div className="space-y-3 text-sm text-muted-foreground">
        <label className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-3 rounded-lg smooth-transition">
          <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
          <span className="text-foreground">Email notifications</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-3 rounded-lg smooth-transition">
          <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
          <span className="text-foreground">Attendance alerts</span>
        </label>
      </div>
    </div>
  );
}

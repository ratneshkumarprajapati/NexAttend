import { CheckCircle, Clock, XCircle, type LucideIcon } from 'lucide-react';

export function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = status.toLowerCase();
  const configs: Record<string, { bg: string; text: string; icon: LucideIcon }> = {
    present: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: CheckCircle },
    absent: { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle },
    late: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: Clock },
  };
  const config = configs[normalizedStatus] || configs.absent;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-3 h-3" />
      {normalizedStatus}
    </span>
  );
}

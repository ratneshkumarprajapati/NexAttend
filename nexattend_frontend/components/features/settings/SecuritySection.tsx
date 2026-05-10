import { Lock } from 'lucide-react';

export function SecuritySection() {
  return (
    <div className="glass rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Lock className="w-5 h-5" />
        Security
      </h3>
      <p className="text-sm text-muted-foreground">
        Password changes are not exposed by the current backend APIs yet.
      </p>
    </div>
  );
}

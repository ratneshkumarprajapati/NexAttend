import { Input } from '@/components/ui/input';
import type { ProfileInputProps } from '@/types';

export function ProfileInput({
  label,
  value,
  type = 'text',
  disabled = false,
  onChange,
}: ProfileInputProps) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground block mb-1">{label}</label>
      <Input
        type={type}
        min={type === 'number' ? '1' : undefined}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        className="bg-white/5"
      />
    </div>
  );
}

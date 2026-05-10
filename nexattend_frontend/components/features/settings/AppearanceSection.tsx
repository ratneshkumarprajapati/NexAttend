'use client';

import { Moon, Sun } from 'lucide-react';

export function AppearanceSection({
  theme,
  setTheme,
}: {
  theme?: string;
  setTheme: (theme: string) => void;
}) {
  return (
    <div className="glass rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Moon className="w-5 h-5" />
        Appearance
      </h3>
      <div className="flex gap-2">
        {['light', 'dark'].map((mode) => (
          <button
            key={mode}
            onClick={() => setTheme(mode)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium smooth-transition border-2 capitalize ${
              theme === mode
                ? 'border-primary bg-primary/20 text-primary'
                : 'border-border bg-white/5 text-muted-foreground hover:text-foreground'
            }`}
          >
            {mode === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {mode}
          </button>
        ))}
      </div>
    </div>
  );
}

'use client';

import { Calendar, Info } from 'lucide-react';

export default function AttendancePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-balance">My Attendance</h1>
        <p className="text-muted-foreground mt-1">Personal attendance history</p>
      </div>

      <div className="glass rounded-xl border border-border/40 p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-primary/10 p-3 text-primary">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Attendance history API not available yet</h2>
            <p className="text-sm text-muted-foreground">
              The backend routes currently exposed in your API collection include the admin student monitor,
              but not a student-specific attendance history endpoint. This tab is now kept stable so it loads
              correctly instead of calling a missing API.
            </p>
            <div className="inline-flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
              <Info className="h-4 w-4" />
              Add a student attendance history API to make this page fully live.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

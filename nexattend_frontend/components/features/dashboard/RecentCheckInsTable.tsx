import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/common/StatusBadge';
import type { RecentCheckIn } from './dashboard-utils';

const PAGE_SIZE = 10;

export function RecentCheckInsTable({ records }: { records: RecentCheckIn[] }) {
  const emptyRows = Math.max(0, PAGE_SIZE - records.length);

  return (
    <div className="glass rounded-xl border border-border/50 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Check-ins</h3>
        <p className="mt-1 text-sm text-muted-foreground">Latest entries</p>
      </div>
      <div className="min-h-[520px] overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead>User Name</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Device</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length > 0 ? (
            records.slice(0, PAGE_SIZE).map((record) => (
              <TableRow key={record.id} className="border-border/30 hover:bg-white/5">
                <TableCell className="text-foreground">{record.name}</TableCell>
                <TableCell className="text-foreground">{record.time}</TableCell>
                <TableCell>
                  <StatusBadge status={record.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">{record.deviceId}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableCell colSpan={4} className="h-[48px] text-center text-muted-foreground">
                No recent check-ins
              </TableCell>
            </TableRow>
          )}
          {Array.from({ length: records.length > 0 ? emptyRows : PAGE_SIZE - 1 }).map((_, index) => (
            <TableRow key={`empty-${index}`} aria-hidden className="h-[48px] border-border/30 hover:bg-transparent">
              <TableCell colSpan={4}>&nbsp;</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}

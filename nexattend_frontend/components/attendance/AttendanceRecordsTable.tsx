'use client';

import { useState } from 'react';
import { Clock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ListPagination } from '@/components/list-pagination';
import { PAGE_SIZE } from '@/utils/constants';
import { calculatePresenceDuration } from '@/utils/helpers';
import { StatusBadge } from '@/components/common/StatusBadge';
import { TableSkeleton } from '@/components/common/page-skeletons';
import type { AttendanceRecordsTableProps } from '@/types';

export function AttendanceRecordsTable({
  records,
  loading = false,
  onRowClick,
}: AttendanceRecordsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedRecords = records.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE,
  );
  const emptyRows = Math.max(0, PAGE_SIZE - paginatedRecords.length);

  return (
    <div className="space-y-4">
      {loading ? (
        <TableSkeleton columns={6} rows={PAGE_SIZE} />
      ) : records.length === 0 ? (
        <div className="flex min-h-120 items-center justify-center text-center text-muted-foreground">
          No attendance records found
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>Student Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>First Seen</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Device</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRecords.map((record) => {
                const duration = calculatePresenceDuration(
                  record.arrivalTime,
                  record.departureTime,
                );

                return (
                  <TableRow
                    key={record.id}
                    className={`h-12 border-border/30 transition-colors duration-300 ${
                      onRowClick
                        ? 'hover:bg-white/5 cursor-pointer'
                        : 'hover:bg-muted/30'
                    }`}
                    onClick={() => onRowClick?.(record)}
                  >
                    <TableCell className="text-foreground font-medium">
                      {record.name}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={record.status} />
                    </TableCell>
                    <TableCell className="text-foreground text-sm">
                      {record.firstSeen}
                    </TableCell>
                    <TableCell className="text-foreground text-sm">
                      {record.lastSeen}
                    </TableCell>
                    <TableCell>
                      {duration ? (
                        <div className="flex items-center gap-1 text-sm text-foreground">
                          <Clock className="h-3 w-3" />
                          {duration}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {record.device}
                    </TableCell>
                  </TableRow>
                );
              })}
              {Array.from({ length: emptyRows }).map((_, index) => (
                <TableRow key={`empty-${index}`} aria-hidden className="h-12 border-border/30 hover:bg-transparent">
                  <TableCell colSpan={6}>&nbsp;</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>

          {records.length > 0 && (
            <ListPagination
              currentPage={safeCurrentPage}
              totalItems={records.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
}



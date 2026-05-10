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
import { ListPagination } from '@/components/common/ListPagination';
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

  return (
    <div className="space-y-4">
      {loading ? (
        <TableSkeleton columns={6} rows={6} />
      ) : records.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          No attendance records found
        </div>
      ) : (
        <>
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
                    className={`border-border/30 transition-colors duration-300 ${
                      onRowClick
                        ? 'cursor-pointer hover:bg-secondary/50'
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
                        <div className="flex items-center gap-1 text-sm text-secondary-foreground">
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
            </TableBody>
          </Table>

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


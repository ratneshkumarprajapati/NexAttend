'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ListPagination } from '@/components/list-pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { userService, type UserRecord } from '@/lib/services/userService';

type StudentFormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNo: string;
  department: string;
  enrolmentNo: string;
  year: string;
  deviceName: string;
  macAddress: string;
};

const initialFormState: StudentFormState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phoneNo: '',
  department: '',
  enrolmentNo: '',
  year: '',
  deviceName: '',
  macAddress: '',
};

const PAGE_SIZE = 10;

function getStudentName(student: UserRecord) {
  return [student.profile?.firstName, student.profile?.lastName].filter(Boolean).join(' ') || student.email;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<StudentFormState>(initialFormState);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    void fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const users = await userService.getAllUsers();
      setStudents(users.filter((user) => user.role === 'STUDENT'));
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    const parsedYear = Number(formData.year);

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.department ||
      !formData.enrolmentNo ||
      !formData.year ||
      !formData.deviceName ||
      !formData.macAddress ||
      !Number.isInteger(parsedYear) ||
      parsedYear <= 0
    ) {
      setError('All student and device fields are required, and year must be a positive number');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await userService.bulkCreateStudents({
        students: [{
          email: formData.email.trim(),
          password: formData.password,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phoneNo: formData.phoneNo.trim() || undefined,
          department: formData.department.trim(),
          enrolmentNo: formData.enrolmentNo.trim(),
          year: parsedYear,
          devices: [{
            deviceName: formData.deviceName.trim(),
            macAddress: formData.macAddress.trim(),
          }],
        }],
      });

      setFormData(initialFormState);
      setShowForm(false);
      await fetchStudents();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create student');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStudent = async (id?: string) => {
    if (!id) return;

    try {
      setError(null);
      await userService.deleteUser(id);
      setStudents((current) => current.filter((student) => student.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete student');
    }
  };

  const filteredStudents = students.filter((student) => {
    const name = getStudentName(student).toLowerCase();
    const email = student.email.toLowerCase();
    const enrolmentNo = student.profile?.enrolmentNo?.toLowerCase() || '';
    const term = search.toLowerCase();
    return name.includes(term) || email.includes(term) || enrolmentNo.includes(term);
  });
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Student Management</h1>
        <p className="text-muted-foreground mt-1">Create and manage student accounts from the live API</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search students by name, email, or enrolment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5"
          />
        </div>
        <Button onClick={() => setShowForm((current) => !current)} className="bg-primary  hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </div>

      {showForm && (
        <div className="glass rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Add New Student</h3>
          <p className="text-sm text-muted-foreground">Provide student profile details and the first registered device.</p>
          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder="First Name" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="bg-white/5" />
            <Input placeholder="Last Name" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="bg-white/5" />
            <Input placeholder="Email Address" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="bg-white/5" />
            <Input placeholder="Password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="bg-white/5" />
            <Input placeholder="Phone Number" value={formData.phoneNo} onChange={(e) => setFormData({ ...formData, phoneNo: e.target.value })} className="bg-white/5" />
            <Input placeholder="Department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="bg-white/5" />
            <Input placeholder="Enrolment Number" value={formData.enrolmentNo} onChange={(e) => setFormData({ ...formData, enrolmentNo: e.target.value })} className="bg-white/5" />
            <Input placeholder="Year" type="number" min="1" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} className="bg-white/5" />
            <Input placeholder="Device Name" value={formData.deviceName} onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })} className="bg-white/5" />
            <Input placeholder="MAC Address" value={formData.macAddress} onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })} className="bg-white/5" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleAddStudent} disabled={saving} className="bg-primary hover:opacity-90">
              {saving ? 'Adding...' : 'Add Student'}
            </Button>
          </div>
        </div>
      )}

      <div className="glass rounded-xl p-6">
        {loading ? (
          <div className="py-12 text-center text-muted-foreground">Loading students...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">No students found</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Enrolment</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStudents.map((student) => (
                <TableRow key={student.id} className="border-border/30 hover:bg-white/5">
                  <TableCell className="text-foreground">{getStudentName(student)}</TableCell>
                  <TableCell className="text-foreground">{student.email}</TableCell>
                  <TableCell className="text-foreground">{student.profile?.phoneNo || 'N/A'}</TableCell>
                  <TableCell className="text-foreground">{student.profile?.department || 'N/A'}</TableCell>
                  <TableCell className="text-foreground">{student.profile?.enrolmentNo || 'N/A'}</TableCell>
                  <TableCell className="text-foreground">{student.profile?.year || 'N/A'}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:text-red-400"
                      onClick={() => void handleDeleteStudent(student.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {!loading && filteredStudents.length > 0 && (
          <ListPagination
            currentPage={currentPage}
            totalItems={filteredStudents.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}

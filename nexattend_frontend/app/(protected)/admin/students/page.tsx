'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Student {
  id: string;
  name: string;
  email: string;
  phoneNo: string;
  enrollmentNumber: string;
  status: 'active' | 'inactive';
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([
    {
      id: '1',
      name: 'Ratnesh Kumar',
      email: 'ratnesh@example.com',
      phoneNo: '9876543210',
      enrollmentNumber: 'ENR001',
      status: 'active',
    },
    {
      id: '2',
      name: 'John Doe',
      email: 'john@example.com',
      phoneNo: '9876543211',
      enrollmentNumber: 'ENR002',
      status: 'active',
    },
  ]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phoneNo: '', enrollmentNumber: '' });

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddStudent = () => {
    if (formData.name && formData.email) {
      setStudents([...students, {
        id: Math.random().toString(),
        ...formData,
        status: 'active',
      }]);
      setFormData({ name: '', email: '', phoneNo: '', enrollmentNumber: '' });
      setShowForm(false);
    }
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Student Management</h1>
        <p className="text-muted-foreground mt-1">Manage student accounts and information</p>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search students by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5"
          />
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </div>

      {/* Add Student Form */}
      {showForm && (
        <div className="glass rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Add New Student</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-white/5"
            />
            <Input
              placeholder="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-white/5"
            />
            <Input
              placeholder="Phone Number"
              value={formData.phoneNo}
              onChange={(e) => setFormData({ ...formData, phoneNo: e.target.value })}
              className="bg-white/5"
            />
            <Input
              placeholder="Enrollment Number"
              value={formData.enrollmentNumber}
              onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
              className="bg-white/5"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddStudent}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              Add Student
            </Button>
          </div>
        </div>
      )}

      {/* Students Table */}
      <div className="glass rounded-xl p-6 overflow-x-auto">
        {filteredStudents.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No students found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border/50">
              <tr className="text-left text-muted-foreground">
                <th className="pb-3 font-semibold">Name</th>
                <th className="pb-3 font-semibold">Email</th>
                <th className="pb-3 font-semibold">Phone</th>
                <th className="pb-3 font-semibold">Enrollment</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="text-foreground hover:bg-white/5 smooth-transition">
                  <td className="py-3">{student.name}</td>
                  <td className="py-3">{student.email}</td>
                  <td className="py-3">{student.phoneNo}</td>
                  <td className="py-3">{student.enrollmentNumber}</td>
                  <td className="py-3">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">
                      {student.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:text-red-400"
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

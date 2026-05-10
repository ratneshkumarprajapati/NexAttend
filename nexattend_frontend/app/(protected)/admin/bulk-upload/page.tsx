'use client';

import { useState } from 'react';
import { Upload, Check, AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBulkCreateStudentsMutation, type BulkStudentEntry } from '@/redux/features/user';
import { getErrorMessage } from '@/utils/errorHandler';

interface UploadResult {
  success: number;
  failed: number;
  errors: string[];
}

export default function BulkUploadPage() {
  const [bulkCreateStudents, { isLoading }] = useBulkCreateStudentsMutation();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        throw new Error('Only CSV files are supported right now');
      }

      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const students: BulkStudentEntry[] = [];
      const errors: string[] = [];

      lines.slice(1).forEach((line, index) => {
        const [
          email,
          password,
          firstName,
          lastName,
          phoneNo,
          department,
          enrolmentNo,
          year,
          deviceName,
          macAddress,
        ] = line.split(',').map((value) => value.trim());

        if (!email || !password || !firstName || !lastName) {
          errors.push(`Row ${index + 2}: email, password, firstName, and lastName are required`);
          return;
        }

        students.push({
          email,
          password,
          firstName,
          lastName,
          phoneNo: phoneNo || undefined,
          department: department || undefined,
          enrolmentNo: enrolmentNo || undefined,
          year: year ? Number(year) : undefined,
          deviceName: deviceName || undefined,
          macAddress: macAddress || undefined,
        });
      });

      if (students.length === 0) {
        setResult({ success: 0, failed: errors.length || 1, errors: errors.length > 0 ? errors : ['No valid student rows found'] });
        return;
      }

      if (errors.length > 0) {
        setResult({ success: 0, failed: errors.length, errors });
        return;
      }

      const uploadResult = await bulkCreateStudents({ students }).unwrap();
      setResult({ success: uploadResult.count, failed: 0, errors: [] });
    } catch (error: unknown) {
      setResult({ success: 0, failed: 1, errors: [getErrorMessage(error, 'Upload failed')] });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Bulk Student Upload</h1>
        <p className="text-muted-foreground mt-1">Upload multiple students from CSV or Excel file</p>
      </div>

      {/* Instructions */}
      <div className="glass rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-foreground">File Format Requirements</h3>
        <p className="text-sm text-muted-foreground">Your CSV/Excel file should have these columns:</p>
        <div className="bg-white/5 rounded-lg p-4 font-mono text-xs text-foreground overflow-x-auto">
          email,password,firstName,lastName,phoneNo,department,enrolmentNo,year,deviceName,macAddress
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Example: student1@example.com,Password@123,Ratnesh,Kumar,9876543210,CSE,ENR001,2,Lab-PC-01,AA:BB:CC:DD:EE:01
        </p>
        <Button
          className="mt-2 bg-primary hover:opacity-90"
          onClick={() => {
            const csv = 'email,password,firstName,lastName,phoneNo,department,enrolmentNo,year,deviceName,macAddress\nstudent1@example.com,Password@123,Ratnesh,Kumar,9876543210,CSE,ENR001,2,Lab-PC-01,AA:BB:CC:DD:EE:01';
            const element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv));
            element.setAttribute('download', 'sample_students.csv');
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
          }}
        >
          <Download className="w-4 h-4 mr-2" />
          Download Sample CSV
        </Button>
      </div>

      {/* Upload Area */}
      {!result && (
        <div
          className={`glass rounded-xl p-12 border-2 border-dashed transition-colors ${
            isDragging
              ? 'border-primary/50 bg-primary/10'
              : 'border-border/30 hover:border-primary/30'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-center space-y-4">
            <div className="inline-block p-4 bg-primary/20 rounded-lg">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-foreground font-medium">
                {file ? file.name : 'Drag and drop your file here'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">or click to select a CSV file</p>
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
            />
            <Button
              asChild
              variant="ghost"
              className="text-primary hover:bg-primary/20"
            >
              <label htmlFor="file-input" className="cursor-pointer">
                Select File
              </label>
            </Button>
          </div>
        </div>
      )}

      {/* Upload Button */}
      {file && !result && (
        <div className="flex gap-2 justify-end">
          <Button
            variant="ghost"
            onClick={() => {
              setFile(null);
              setResult(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isLoading}
            className="bg-primary hover:opacity-90"
          >
            {isLoading ? 'Uploading...' : 'Upload Students'}
          </Button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="glass rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            {result.failed === 0 ? (
              <Check className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-400" />
            )}
            <h3 className="font-semibold text-foreground">Upload Complete</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
              <p className="text-sm text-muted-foreground">Successfully Added</p>
              <p className="text-2xl font-bold text-green-400">{result.success}</p>
            </div>
            <div className={`rounded-lg p-4 border ${
              result.failed > 0
                ? 'bg-red-500/10 border-red-500/20'
                : 'bg-muted/20 border-border/30'
            }`}>
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className={`text-2xl font-bold ${result.failed > 0 ? 'text-red-400' : 'text-foreground'}`}>
                {result.failed}
              </p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Errors</p>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 max-h-48 overflow-y-auto space-y-1">
                {result.errors.map((error, i) => (
                  <p key={i} className="text-xs text-red-400">{error}</p>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={() => {
              setFile(null);
              setResult(null);
            }}
            className="w-full bg-linear-to-r from-primary to-accent hover:opacity-90"
          >
            Upload Another File
          </Button>
        </div>
      )}
    </div>
  );
}

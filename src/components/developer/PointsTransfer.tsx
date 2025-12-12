import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/local-client';
import { Search, Send } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  total_points: number;
}

interface PointsTransferProps {
  schoolId: string;
}

export default function PointsTransfer({ schoolId }: PointsTransferProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [fromStudent, setFromStudent] = useState<Student | null>(null);
  const [toStudent, setToStudent] = useState<Student | null>(null);
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/functions/search-students`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            schoolId,
            searchTerm,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to search students');
      }

      setStudents(result.students || []);
    } catch (error: any) {
      toast({
        title: 'Search failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!fromStudent || !toStudent || !points) {
      toast({
        title: 'Missing information',
        description: 'Please select both students and enter points amount',
        variant: 'destructive',
      });
      return;
    }

    if (fromStudent.id === toStudent.id) {
      toast({
        title: 'Invalid transfer',
        description: 'Cannot transfer points to the same student',
        variant: 'destructive',
      });
      return;
    }

    const pointsNum = parseInt(points);
    if (pointsNum <= 0) {
      toast({
        title: 'Invalid points',
        description: 'Points must be greater than 0',
        variant: 'destructive',
      });
      return;
    }

    if (pointsNum > fromStudent.total_points) {
      toast({
        title: 'Insufficient points',
        description: `${fromStudent.name} only has ${fromStudent.total_points} points`,
        variant: 'destructive',
      });
      return;
    }

    setTransferLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/functions/transfer-points`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            fromStudentId: fromStudent.id,
            toStudentId: toStudent.id,
            points: pointsNum,
            reason: reason || 'Admin transfer',
            schoolId: schoolId,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to transfer points');
      }

      toast({
        title: 'Transfer successful',
        description: `Transferred ${pointsNum} points from ${fromStudent.name} to ${toStudent.name}`,
      });

      // Reset form
      setFromStudent(null);
      setToStudent(null);
      setPoints('');
      setReason('');
      setSearchTerm('');
      setStudents([]);
    } catch (error: any) {
      toast({
        title: 'Transfer failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setTransferLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Transfer Points Between Students</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Students</Label>
              <div className="flex gap-2">
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button
                  onClick={handleSearch}
                  disabled={loading || !searchTerm.trim()}
                  className="gap-2"
                >
                  <Search className="w-4 h-4" />
                  Search
                </Button>
              </div>
            </div>

            {/* Search Results */}
            {students.length > 0 && (
              <div className="space-y-2">
                <Label>Select Students</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* From Student */}
                  <div>
                    <p className="text-sm font-medium mb-2">From Student</p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {students.map((student) => (
                        <button
                          key={`from-${student.id}`}
                          onClick={() => setFromStudent(student)}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                            fromStudent?.id === student.id
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-gray-600">{student.email}</div>
                          <div className="text-sm font-semibold text-purple-600 mt-1">
                            {student.total_points} points
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* To Student */}
                  <div>
                    <p className="text-sm font-medium mb-2">To Student</p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {students.map((student) => (
                        <button
                          key={`to-${student.id}`}
                          onClick={() => setToStudent(student)}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                            toStudent?.id === student.id
                              ? 'border-green-600 bg-green-50'
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                        >
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-gray-600">{student.email}</div>
                          <div className="text-sm font-semibold text-green-600 mt-1">
                            {student.total_points} points
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Selected Students Summary */}
          {(fromStudent || toStudent) && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">From</p>
                  <p className="font-semibold">{fromStudent?.name || 'Not selected'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">To</p>
                  <p className="font-semibold">{toStudent?.name || 'Not selected'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Transfer Details */}
          {fromStudent && toStudent && (
            <div className="space-y-4 border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="points">Points to Transfer</Label>
                  <Input
                    id="points"
                    type="number"
                    placeholder="0"
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    min="1"
                    max={fromStudent.total_points}
                  />
                  <p className="text-xs text-gray-600">
                    Available: {fromStudent.total_points} points
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Input
                  id="reason"
                  placeholder="e.g., Correction, adjustment, etc."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <Button
                onClick={handleTransfer}
                disabled={transferLoading || !points}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 gap-2"
              >
                <Send className="w-4 h-4" />
                {transferLoading ? 'Transferring...' : 'Transfer Points'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

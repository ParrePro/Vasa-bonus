import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const GivePointsView = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('http://localhost:3001/api/classes', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load classes');
      }

      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Classes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <p className="text-muted-foreground">Loading classes...</p>
          ) : classes.length === 0 ? (
            <p className="text-muted-foreground">You haven't created or joined any classes yet.</p>
          ) : (
            classes.map((cls) => (
              <Button
                key={cls.id}
                variant="outline"
                className="w-full justify-between"
                onClick={() => navigate(`/teacher/class/${cls.id}`)}
              >
                <span>{cls.name}</span>
                <span className="text-sm text-muted-foreground">{cls.code}</span>
              </Button>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GivePointsView;

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/local-client";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);
    return () => clearTimeout(timer);
  }, [navigate]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const roleData = await supabase.roles.checkRole();

      if (!roleData?.data?.hasRole) {
        navigate("/role-selection");
      } else {
        switch (roleData.data.role) {
          case "teacher":
            navigate("/teacher");
            break;
          case "student":
            navigate("/student");
            break;
          case "developer":
            navigate("/developer");
            break;
          default:
            navigate("/role-selection");
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg">Loading...</p>
    </div>
  );
};

export default Index;

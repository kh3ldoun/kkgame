import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
      <h1 className="text-6xl font-bold text-primary font-mono">404</h1>
      <p className="text-muted-foreground text-lg">Page not found</p>
      <Button onClick={() => navigate("/")} className="bg-primary text-primary-foreground">
        <Home className="w-4 h-4 mr-2" /> Go Home
      </Button>
    </div>
  );
};
export default NotFound;

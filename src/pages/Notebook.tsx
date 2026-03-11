import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Brain, User, TrendingUp, LogOut, Info, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import AnimatedBackground from "@/components/AnimatedBackground";

interface LoginHistory {
  id: number;
  email: string;
  login_time: string;
}

interface Prediction {
  id: number;
  module_name: string;
  result: string;
  created_at: string;
}

const Notebook = () => {

  const navigate = useNavigate();

  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    navigate("/signin");
  };

  useEffect(() => {

    const userId = localStorage.getItem("user_id");

    if (!userId) {
      navigate("/signin");
      return;
    }

    fetchData(userId);

    // auto refresh every 2 seconds
    const interval = setInterval(() => {
      fetchData(userId);
    }, 2000);

    return () => clearInterval(interval);

  }, []);

  const fetchData = async (userId: string) => {

    try {

      setLoading(true);

      // Login History
      const loginRes = await fetch(`http://127.0.0.1:5000/login-history/${userId}`);
      const loginData = await loginRes.json();

      // Prediction History
      const predRes = await fetch(`http://127.0.0.1:5000/prediction-history/${userId}`);
      const predData = await predRes.json();

      console.log("Prediction history:", predData);

      setLoginHistory(Array.isArray(loginData) ? loginData : []);
      setPredictions(Array.isArray(predData) ? predData : []);

    } catch (error) {

      console.error("Error fetching data:", error);

      setLoginHistory([]);
      setPredictions([]);

    } finally {

      setLoading(false);

    }

  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString();

  const predArray = Array.isArray(predictions) ? predictions : [];

  const defectiveCount =
    predArray.filter((p) => p.result === "Defective").length;

  const nonDefectiveCount =
    predArray.filter((p) => p.result === "Non-Defective").length;

  return (
    <div className="min-h-screen relative">

      <AnimatedBackground />

      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Notebook - Activity Log</h1>
          </div>

          <div className="flex items-center gap-3">

            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              <Brain className="w-4 h-4 mr-2" /> Dashboard
            </Button>

            <Button variant="outline" onClick={() => navigate("/analytics")}>
              <BarChart3 className="w-4 h-4 mr-2" /> Analytics
            </Button>

            <Button variant="outline" onClick={() => navigate("/about")}>
              <Info className="w-4 h-4 mr-2" /> About
            </Button>

            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>

          </div>

        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-8 relative z-10">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="w-6 h-6 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Predictions
                </p>
                <p className="text-2xl font-bold">{predArray.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Brain className="w-6 h-6 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Defective Modules
                </p>
                <p className="text-2xl font-bold">{defectiveCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <User className="w-6 h-6 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Login Sessions
                </p>
                <p className="text-2xl font-bold">{loginHistory.length}</p>
              </div>
            </div>
          </Card>

        </div>

        {/* Tabs */}
        <Tabs defaultValue="predictions" className="space-y-6">

          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-secondary">
            <TabsTrigger value="predictions">Prediction History</TabsTrigger>
            <TabsTrigger value="logins">Login History</TabsTrigger>
          </TabsList>

          {/* Prediction History */}
          <TabsContent value="predictions">

            <Card className="p-6">

              <h2 className="text-xl font-semibold mb-4">
                Your Predictions
              </h2>

              {loading ? (
                <p>Loading...</p>
              ) : predArray.length === 0 ? (
                <p>No predictions yet.</p>
              ) : (

                <div className="space-y-4">

                  {predArray.map((pred) => (

                    <Card key={pred.id} className="p-4">

                      <div className="flex items-center justify-between">

                        <div>

                          <h3 className="font-semibold">
                            Module: {pred.module_name}
                          </h3>

                          <p className="text-sm text-muted-foreground">
                            {formatDate(pred.created_at)}
                          </p>

                        </div>

                        <Badge
                          variant={
                            pred.result === "Defective"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {pred.result}
                        </Badge>

                      </div>

                    </Card>

                  ))}

                </div>

              )}

            </Card>

          </TabsContent>

          {/* Login History */}
          <TabsContent value="logins">

            <Card className="p-6">

              <h2 className="text-xl font-semibold mb-4">
                Login History
              </h2>

              {loading ? (
                <p>Loading...</p>
              ) : loginHistory.length === 0 ? (
                <p>No login history available.</p>
              ) : (

                <div className="space-y-3">

                  {loginHistory.map((login) => (

                    <Card key={login.id} className="p-4">

                      <div className="flex items-center gap-3">

                        <User className="w-5 h-5 text-primary" />

                        <div>

                          <p className="font-semibold">
                            {login.email}
                          </p>

                          <p className="text-sm text-muted-foreground">
                            {formatDate(login.login_time)}
                          </p>

                        </div>

                      </div>

                    </Card>

                  ))}

                </div>

              )}

            </Card>

          </TabsContent>

        </Tabs>

      </main>

    </div>
  );
};

export default Notebook;
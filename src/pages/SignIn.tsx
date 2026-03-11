import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Brain, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const SignIn = () => {

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {

    e.preventDefault();
    setLoading(true);

    try {

      const data: any = await signIn(email, password);

      // 🔴 ADD THIS ONLY (store current logged user)
      if (data?.user_id) {
        localStorage.removeItem("user_id");
        localStorage.setItem("user_id", data.user_id.toString());
        console.log("Logged in user:", data.user_id);
      }

      // redirect after login
      navigate("/selection");

    } catch (error) {

      console.error("Sign in error:", error);

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen bg-background flex items-center justify-center p-4">

      <Card className="w-full max-w-md p-8 border-border">

        <div className="flex items-center justify-center mb-8">
          <Brain className="w-12 h-12 text-primary" />
        </div>

        <h1 className="text-3xl font-bold text-center mb-2">
          Welcome Back
        </h1>

        <p className="text-muted-foreground text-center mb-8">
          Sign in to your HSoMLSDP account
        </p>

        <form onSubmit={handleSignIn} className="space-y-6">

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>

            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-card border-border"
            />
          </div>

          <div className="space-y-2">

            <Label htmlFor="password">Password</Label>

            <div className="relative">

              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-card border-border pr-10"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>

            </div>

            <div className="flex justify-end">

              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot Password?
              </Link>

            </div>

          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>

        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">

          Don't have an account?{" "}

          <Link to="/signup" className="text-primary hover:underline">
            Sign Up
          </Link>

        </p>

      </Card>

    </div>

  );

};

export default SignIn;
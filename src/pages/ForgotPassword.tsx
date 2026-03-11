import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
// import { Brain } from "lucide-react";
// import { Link } from "react-router-dom";
import { Brain, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/client";
import { useToast } from "@/hooks/use-toast";
const ForgotPassword = () => {
    const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("reset");
  };
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }
    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      
      toast({
        title: "Completed.",
        description: "Password changed successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 border-card-alt/30 bg-card-alt text-card-alt-foreground">
        <div className="flex items-center justify-center mb-8">
          <Brain className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-center mb-2 text-card-alt-foreground">
          {step === "email" ? "Forgot Password" : "Reset Password"}
        </h1>
        <p className="text-card-alt-foreground/70 text-center mb-8">
          {step === "email"
            ? "Enter your email address to continue"
            : "Enter your new password"}
        </p>
        {step === "email" ? (
          <form onSubmit={handleNext} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-card-alt-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-card-alt-foreground/10 border-card-alt-foreground/30 text-card-alt-foreground placeholder:text-card-alt-foreground/50"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Next
            </Button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-card-alt-foreground">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-card-alt-foreground/10 border-card-alt-foreground/30 text-card-alt-foreground placeholder:text-card-alt-foreground/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-card-alt-foreground">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-card-alt-foreground/10 border-card-alt-foreground/30 text-card-alt-foreground placeholder:text-card-alt-foreground/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        )}
        <p className="text-center text-sm text-card-alt-foreground/70 mt-6">
          <Link to="/signin" className="text-primary hover:underline">
            Back to Sign In
          </Link>
        </p>
      </Card>
    </div>
  );
};
export default ForgotPassword;
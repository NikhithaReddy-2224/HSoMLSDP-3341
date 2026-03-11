import { useState, createContext, useContext, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  email: string;
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const BASE_URL = "http://localhost:5000"; // ✅ changed to localhost

  // =============================
  // SIGN UP
  // =============================
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const response = await fetch(`${BASE_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      toast({
        title: "Account created successfully!",
        description: "You can now sign in.",
      });

      navigate("/signin");
    } catch (error: any) {
      console.error("Signup error:", error);

      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message || "Server not reachable",
      });

      throw error;
    }
  };

  // =============================
  // SIGN IN
  // =============================
  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      const loggedInUser: User = {
        id: data.user_id,
        email: email,
      };

      setUser(loggedInUser);

      localStorage.setItem("user_id", data.user_id.toString());

      toast({
        title: "Welcome back!",
        description: "Login successful.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);

      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message || "Cannot connect to server",
      });

      throw error;
    }
  };

  // =============================
  // SIGN OUT
  // =============================
  const signOut = () => {
    setUser(null);
    localStorage.removeItem("user_id");
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PredictionResult } from "@/pages/Dashboard";
interface ManualInputSectionProps {
  setResults: (results: PredictionResult[]) => void;
}

// Fast rules-based defect prediction (same as UploadSection)
const predictDefect = (data: Record<string, number>): { label: "Defective" | "Non-Defective"; probability: number; limeFeatures: Record<string, number> } => {
  let score = 0;
  const weights: Record<string, number> = {};
  
  // High cyclomatic complexity (>10) strongly indicates defects
  if (data.vg > 10) {
    score += 0.25;
    weights.vg = 0.25;
  } else if (data.vg > 5) {
    score += 0.1;
    weights.vg = 0.1;
  } else {
    weights.vg = -0.05;
  }
  
  // High essential complexity (>4) indicates structural problems
  if (data.evg > 4) {
    score += 0.2;
    weights.evg = 0.2;
  } else {
    weights.evg = -0.05;
  }
  
  // High design complexity
  if (data.ivg > 4) {
    score += 0.1;
    weights.ivg = 0.1;
  } else {
    weights.ivg = -0.03;
  }
  
  // High Halstead difficulty (>20)
  if (data.d > 20) {
    score += 0.15;
    weights.d = 0.15;
  } else if (data.d > 10) {
    score += 0.05;
    weights.d = 0.05;
  } else {
    weights.d = -0.05;
  }
  
  // Halstead estimated bugs (>0.1)
  if (data.b > 0.1) {
    score += 0.2;
    weights.b = 0.2;
  } else if (data.b > 0.05) {
    score += 0.1;
    weights.b = 0.1;
  } else {
    weights.b = -0.05;
  }
  
  // Low program level (<0.1) indicates error-prone code
  if (data.l < 0.1 && data.l > 0) {
    score += 0.1;
    weights.l = 0.1;
  } else {
    weights.l = -0.03;
  }
  
  // High effort (>1000)
  if (data.e > 1000) {
    score += 0.1;
    weights.e = 0.1;
  } else {
    weights.e = -0.03;
  }
  
  // Large LOC (>100)
  if (data.loc > 100) {
    score += 0.1;
    weights.loc = 0.1;
  } else if (data.loc > 50) {
    score += 0.05;
    weights.loc = 0.05;
  } else {
    weights.loc = -0.05;
  }
  
  // High branch count relative to LOC
  const branchRatio = data.loc > 0 ? data.branchCount / data.loc : 0;
  if (branchRatio > 0.1) {
    score += 0.1;
    weights.branchCount = 0.1;
  } else {
    weights.branchCount = -0.03;
  }
  
  // Low comment ratio (poor documentation)
  const commentRatio = data.loc > 0 ? data.lOComment / data.loc : 0;
  if (commentRatio < 0.1) {
    score += 0.05;
    weights.lOComment = 0.05;
  } else {
    weights.lOComment = -0.05;
  }
  
  // Halstead volume
  if (data.v > 1000) {
    score += 0.05;
    weights.v = 0.05;
  } else {
    weights.v = -0.02;
  }
  
  // Normalize probability to 0-1 range
  const probability = Math.min(Math.max(score, 0), 1);
  const label = probability >= 0.5 ? "Defective" : "Non-Defective";
  
  return { label, probability, limeFeatures: weights };
};



const ManualInputSection = ({ setResults }: ManualInputSectionProps) => {
  const { toast } = useToast();
  // const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    loc: "",
    vg: "",
    evg: "",
    ivg: "",
    n: "",
    v: "",
    l: "",
    d: "",
    i: "",
    e: "",
    b: "",
    t: "",
    lOCode: "",
    lOComment: "",
    lOBlank: "",
    locCodeAndComment: "",
    uniqOp: "",
    uniqOpnd: "",
    totalOp: "",
    totalOpnd: "",
    branchCount: "",



  });

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  console.log("Predict button clicked");
  console.log("Form data:", formData);

  setLoading(true);

  try {
      const numericData: Record<string, number> = {};
      for (const [key, value] of Object.entries(formData)) {
        numericData[key] = parseFloat(value) || 0;
      }


      const userId = localStorage.getItem("user_id");
if (!userId) {
  toast({
    variant: "destructive",
    title: "User not logged in",
    description: "Please login again.",
  });
  setLoading(false);
  return;
}

const moduleId = `manual-${Date.now()}`;

const res = await fetch("http://127.0.0.1:5000/predict", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    user_id: userId,
    moduleId: moduleId,
    features: numericData,
  }),
});

const data = await res.json();

console.log("Backend response:", data);

if (!res.ok) {
  console.error("Backend error:", data);
  throw new Error(data.error || "Prediction failed");
}
const result: PredictionResult = {
  id: moduleId,
  label: data.label,
  probability: data.probability,
  limeFeatures: data.limeFeatures || {},
};

      setResults([result]);
      toast({
        title: "Prediction Complete",
        description: `Module classified as ${result.label} ${result.label === "Defective" ? "❌" : "✅"}`,
      });
    } catch (error) {
      console.error("Prediction error:", error);
      toast({
        variant: "destructive",
        title: "Prediction Failed",
        description: "Unable to process prediction. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };




  // const inputClass = "bg-card-alt-foreground/10 border-card-alt-foreground/30 text-card-alt-foreground placeholder:text-black/60";
  const inputClass =
  "bg-white text-black border-gray-300 placeholder:text-gray-500 focus:placeholder:text-gray-400";



  return (
    <Card className="p-6 bg-card-alt border-card-alt/30 text-card-alt-foreground">
      <h2 className="text-2xl font-semibold mb-4 text-card-alt-foreground">Manual Input</h2>
      <p className="text-card-alt-foreground/70 mb-6">
        Enter NASA MDP software metrics manually for instant defect prediction
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* McCabe Metrics */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-card-alt-foreground/80">McCabe Metrics</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="loc" className="text-card-alt-foreground text-xs">LOC</Label>
              <Input
                id="loc"
                type="number"
                placeholder="Lines of Code"
                value={formData.loc}
                onChange={(e) => setFormData({ ...formData, loc: e.target.value })}
                required
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="vg" className="text-card-alt-foreground text-xs">v(g)</Label>
              <Input
                id="vg"
                type="number"
                placeholder="Cyclomatic"
                value={formData.vg}
                onChange={(e) => setFormData({ ...formData, vg: e.target.value })}
                required
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="evg" className="text-card-alt-foreground text-xs">ev(g)</Label>
              <Input
                id="evg"
                type="number"
                placeholder="Essential"
                value={formData.evg}
                onChange={(e) => setFormData({ ...formData, evg: e.target.value })}
                required
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="ivg" className="text-card-alt-foreground text-xs">iv(g)</Label>
              <Input
                id="ivg"
                type="number"
                placeholder="Design"
                value={formData.ivg}
                onChange={(e) => setFormData({ ...formData, ivg: e.target.value })}
                required
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Halstead Base Metrics */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-card-alt-foreground/80">Halstead Metrics</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="n" className="text-card-alt-foreground text-xs">N (Length)</Label>
              <Input
                id="n"
                type="number"
                placeholder="Total Ops"
                value={formData.n}
                onChange={(e) => setFormData({ ...formData, n: e.target.value })}
                required
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="v" className="text-card-alt-foreground text-xs">V (Volume)</Label>
              <Input
                id="v"
                type="number"
                step="0.01"
                placeholder="Volume"
                value={formData.v}
                onChange={(e) => setFormData({ ...formData, v: e.target.value })}
                required
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="l" className="text-card-alt-foreground text-xs">L (Level)</Label>
              <Input
                id="l"
                type="number"
                step="0.001"
                placeholder="Program Level"
                value={formData.l}
                onChange={(e) => setFormData({ ...formData, l: e.target.value })}
                required
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="d" className="text-card-alt-foreground text-xs">D (Difficulty)</Label>
              <Input
                id="d"
                type="number"
                step="0.01"
                placeholder="Difficulty"
                value={formData.d}
                onChange={(e) => setFormData({ ...formData, d: e.target.value })}
                required
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="i" className="text-card-alt-foreground text-xs">I (Intelligence)</Label>
              <Input
                id="i"
                type="number"
                step="0.01"
                placeholder="Intelligence"
                value={formData.i}
                onChange={(e) => setFormData({ ...formData, i: e.target.value })}
                required
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="e" className="text-card-alt-foreground text-xs">E (Effort)</Label>
              <Input
                id="e"
                type="number"
                step="0.01"
                placeholder="Effort"
                value={formData.e}
                onChange={(e) => setFormData({ ...formData, e: e.target.value })}
                required
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="b" className="text-card-alt-foreground text-xs">B (Est. Bugs)</Label>
              <Input
                id="b"
                type="number"
                step="0.001"
                placeholder="Est. Bugs"
                value={formData.b}
                onChange={(e) => setFormData({ ...formData, b: e.target.value })}
                required
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="t" className="text-card-alt-foreground text-xs">T (Time)</Label>
              <Input
                id="t"
                type="number"
                step="0.01"
                placeholder="Time to Program"
                value={formData.t}
                onChange={(e) => setFormData({ ...formData, t: e.target.value })}
                required
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Line Counts */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-card-alt-foreground/80">Line Counts</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="lOCode" className="text-card-alt-foreground text-xs">Lines of Code</Label>
              <Input
                id="lOCode"
                type="number"
                placeholder="Code Lines"
                value={formData.lOCode}
                onChange={(e) => setFormData({ ...formData, lOCode: e.target.value })}
                required
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="lOComment" className="text-card-alt-foreground text-xs">Lines of Comment</Label>
              <Input
                id="lOComment"
                type="number"
                placeholder="Comment Lines"
                value={formData.lOComment}
                onChange={(e) => setFormData({ ...formData, lOComment: e.target.value })}
                required
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="lOBlank" className="text-card-alt-foreground text-xs">Blank Lines</Label>
              <Input
                id="lOBlank"
                type="number"
                placeholder="Blank Lines"
                value={formData.lOBlank}
                onChange={(e) => setFormData({ ...formData, lOBlank: e.target.value })}
                required
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="locCodeAndComment" className="text-card-alt-foreground text-xs">Code & Comment</Label>
              <Input
                id="locCodeAndComment"
                type="number"
                placeholder="Code+Comment"
                value={formData.locCodeAndComment}
                onChange={(e) => setFormData({ ...formData, locCodeAndComment: e.target.value })}
                required
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Operator/Operand Counts */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-card-alt-foreground/80">Operators & Operands</h3>
          <div className="grid md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="uniqOp" className="text-card-alt-foreground text-xs">Unique Ops</Label>
              <Input
                id="uniqOp"
                type="number"
                placeholder="Unique"
                value={formData.uniqOp}
                onChange={(e) => setFormData({ ...formData, uniqOp: e.target.value })}
                required
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="uniqOpnd" className="text-card-alt-foreground text-xs">Unique Opnds</Label>
              <Input
                id="uniqOpnd"
                type="number"
                placeholder="Unique"
                value={formData.uniqOpnd}
                onChange={(e) => setFormData({ ...formData, uniqOpnd: e.target.value })}
                required
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="totalOp" className="text-card-alt-foreground text-xs">Total Ops</Label>
              <Input
                id="totalOp"
                type="number"
                placeholder="Total"
                value={formData.totalOp}
                onChange={(e) => setFormData({ ...formData, totalOp: e.target.value })}
                required
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="totalOpnd" className="text-card-alt-foreground text-xs">Total Opnds</Label>
              <Input
                id="totalOpnd"
                type="number"
                placeholder="Total"
                value={formData.totalOpnd}
                onChange={(e) => setFormData({ ...formData, totalOpnd: e.target.value })}
                required
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="branchCount" className="text-card-alt-foreground text-xs">Branch Count</Label>
              <Input
                id="branchCount"
                type="number"
                placeholder="Branches"
                value={formData.branchCount}
                onChange={(e) => setFormData({ ...formData, branchCount: e.target.value })}
                required
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          {loading ? "Analyzing..." : "Predict Defect"}
        </Button>
      </form>
    </Card>
  );
};
export default ManualInputSection;



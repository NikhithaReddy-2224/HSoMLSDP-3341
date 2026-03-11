const DEMO_PREDICTIONS_KEY = "demo_predictions";
const DEMO_LOGIN_HISTORY_KEY = "demo_login_history";

export interface DemoPrediction {
  id: string;
  module_id: string;
  prediction_label: string;
  probability: number;
  input_features: Record<string, any>;
  lime_features: Record<string, any> | null;
  created_at: string;
  user_id: string;
}

export interface DemoLoginEntry {
  id: string;
  email: string;
  login_time: string;
  user_id: string;
}

export const demoStorage = {
  // --- Predictions ---
  getPredictions: (): DemoPrediction[] => {
    try {
      const data = localStorage.getItem(DEMO_PREDICTIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addPrediction: (prediction: Omit<DemoPrediction, "id" | "created_at">): DemoPrediction => {
    const entry: DemoPrediction = {
      ...prediction,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    const existing = demoStorage.getPredictions();
    localStorage.setItem(DEMO_PREDICTIONS_KEY, JSON.stringify([entry, ...existing]));
    return entry;
  },

  // --- Login History ---
  getLoginHistory: (): DemoLoginEntry[] => {
    try {
      const data = localStorage.getItem(DEMO_LOGIN_HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addLoginEntry: (email: string, userId: string): DemoLoginEntry => {
    const entry: DemoLoginEntry = {
      id: crypto.randomUUID(),
      email,
      login_time: new Date().toISOString(),
      user_id: userId,
    };
    const existing = demoStorage.getLoginHistory();
    localStorage.setItem(DEMO_LOGIN_HISTORY_KEY, JSON.stringify([entry, ...existing]));
    return entry;
  },

  // --- Clear all demo data ---
  clear: () => {
    localStorage.removeItem(DEMO_PREDICTIONS_KEY);
    localStorage.removeItem(DEMO_LOGIN_HISTORY_KEY);
  },
};

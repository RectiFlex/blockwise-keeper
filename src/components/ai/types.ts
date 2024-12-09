export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface WarrantyAnalysis {
  coverage: string[];
  suggestions: string[];
}

export interface AIResponse {
  response: string;
}
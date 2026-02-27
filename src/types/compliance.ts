export enum ComplianceDecision {
  SAFE = "SAFE TO POST",
  CHANGES = "POST WITH CHANGES",
  DO_NOT_POST = "DO NOT POST"
}

export interface FlaggedSegment {
  timestamp?: string;
  text?: string;
  reason: string;
  policyViolation: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
}

export interface AnalysisResult {
  decision: ComplianceDecision;
  overallRiskScore: number;
  captionRiskScore: number;
  videoRiskScore: number;
  flaggedSegments: FlaggedSegment[];
  reasoning: string;
  requiredFixes: string[];
  saferCaption?: string;
  saferScript?: string;
  categoryDetected: string;
}

export type ReportStatus =
  | "submitted"
  | "verified"
  | "in_progress"
  | "resolved";

export type ReportSeverity = "low" | "medium" | "high";

export type BarrierCategory =
  | "ramp"
  | "elevator"
  | "sidewalk"
  | "restroom"
  | "entrance"
  | "construction"
  | "other";

export type AccessibilityReport = {
  id: string;
  locationName: string;
  address: string;
  category: BarrierCategory;
  title: string;
  description: string;
  severity: ReportSeverity;
  status: ReportStatus;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
  reporterName?: string;
  adminNote?: string;
};
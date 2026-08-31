import type { AccessibilityReport } from "@/types/report";

export type DatabaseReport = {
  id: string;
  title: string;
  location_name: string;
  address: string;
  category: AccessibilityReport["category"];
  description: string;
  severity: AccessibilityReport["severity"];
  status: AccessibilityReport["status"];
  latitude: number | null;
  longitude: number | null;
  admin_note: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export function mapDatabaseReport(
  report: DatabaseReport,
): AccessibilityReport {
  return {
    id: report.id,
    title: report.title,
    locationName: report.location_name,
    address: report.address,
    category: report.category,
    description: report.description,
    severity: report.severity,
    status: report.status,
    latitude: report.latitude ?? 0,
    longitude: report.longitude ?? 0,
    adminNote: report.admin_note ?? undefined,
    imageUrl: report.image_url ?? undefined,
    createdAt: report.created_at,
    updatedAt: report.updated_at,
  };
}
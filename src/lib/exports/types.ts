export type ExportType =
  | "weekly_report"
  | "errors_by_topic"
  | "study_material"
  | "bookmarks"
  | "progress_snapshot";

export type ExportDateRange = {
  from: string;
  to: string;
};

export type ExportRequest = {
  type: ExportType;
  userId: string;
  profileName?: string | null;
  dateRange?: ExportDateRange;
  topic?: string | null;
  studyGoal?: string | null;
};

export type ExportDocument = {
  filename: string;
  markdown: string;
};

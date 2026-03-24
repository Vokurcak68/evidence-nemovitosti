/**
 * Table name constants — prefixed to avoid collisions
 * when sharing Supabase project with other apps.
 */
export const T = {
  user_profiles: "en_user_profiles",
  projects: "en_projects",
  project_plots: "en_project_plots",
  project_actions: "en_project_actions",
  project_attachments: "en_project_attachments",
} as const;

/** Storage bucket name */
export const BUCKET_ATTACHMENTS = "en-attachments";

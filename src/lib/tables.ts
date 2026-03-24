/**
 * Table name constants — prefixed to avoid collisions
 * when sharing Supabase project with other apps.
 */
export const T = {
  user_profiles: "en_user_profiles",
  plots: "en_plots",
  plot_photos: "en_plot_photos",
  tasks: "en_tasks",
} as const;

/** Storage bucket name */
export const BUCKET_PLOT_PHOTOS = "en-plot-photos";

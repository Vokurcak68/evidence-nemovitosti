export type UserRole = "admin" | "user";

export type UserProfile = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
};

export type Plot = {
  id: string;
  name: string;
  address: string | null;
  cadastral_number: string | null;
  lv_number: string | null;
  area_m2: number | null;
  gps_lat: number | null;
  gps_lng: number | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type PlotPhoto = {
  id: string;
  plot_id: string;
  url: string;
  caption: string | null;
  uploaded_by: string | null;
  created_at: string;
};

export type TaskStatus = "todo" | "done";

export type Task = {
  id: string;
  plot_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assigned_to: string | null;
  deadline: string | null;
  completed_at: string | null;
  reminder_date: string | null;
  reminder_sent: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

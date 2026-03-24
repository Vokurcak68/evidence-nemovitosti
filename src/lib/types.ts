export type UserRole = "admin" | "user";

export type UserProfile = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  current_up_state: string | null;
  target_up_state: string | null;
  min_parcel_area: string | null;
  restrictions: string | null;
  purchase_price: string | null;
  purchase_date: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectPlot = {
  id: string;
  project_id: string;
  parcel_number: string;
  area_m2: number | null;
  notes: string | null;
  created_at: string;
};

export type ProjectAction = {
  id: string;
  project_id: string;
  action_date: string;
  description: string;
  person: string | null;
  contact: string | null;
  created_by: string | null;
  created_at: string;
};

export type ProjectAttachment = {
  id: string;
  project_id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  category: string | null;
  uploaded_by: string | null;
  created_at: string;
};

export type ActionStatus = "todo" | "done";

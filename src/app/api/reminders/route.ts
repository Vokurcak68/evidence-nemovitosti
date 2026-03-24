import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET() {
  const supabase = createSupabaseAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("id,title,assigned_to,reminder_date,reminder_sent")
    .eq("status", "todo")
    .eq("reminder_sent", false)
    .lte("reminder_date", today);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const updated: string[] = [];

  for (const task of tasks ?? []) {
    console.log("REMINDER", {
      task_id: task.id,
      title: task.title,
      assigned_to: task.assigned_to,
      note: "Zde by se posílal email/push notifikace.",
    });

    const { error: updateError } = await supabase
      .from("tasks")
      .update({ reminder_sent: true, updated_at: new Date().toISOString() })
      .eq("id", task.id);

    if (!updateError) {
      updated.push(task.id);
    }
  }

  return NextResponse.json({ ok: true, today, found: tasks?.length ?? 0, updated: updated.length, updated_ids: updated });
}

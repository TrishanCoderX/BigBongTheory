import { clearStaffSessionCookie } from "@/lib/staffSession";

export async function POST() {
  await clearStaffSessionCookie();
  return Response.json({ ok: true });
}

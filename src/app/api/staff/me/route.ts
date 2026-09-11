import { getStaffSession } from "@/lib/staffSession";

export async function GET() {
  const staff = await getStaffSession();
  return Response.json({ staff });
}

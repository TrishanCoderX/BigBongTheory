import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/staffSession";

const TINTS = ["#1B1B22", "#22140F", "#101A14", "#1A1520", "#1C2B0D", "#0F1A22"];
const VALID_STATUSES = new Set(["LIVE", "DRAFT"]);

export async function POST(request: Request) {
  const gate = await requireStaff("SUPER_ADMIN");
  if ("error" in gate) return gate.error;

  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const city = String(body?.city ?? "").trim();
  const date = String(body?.date ?? "").trim();
  const cat = String(body?.cat ?? "").trim();
  const time = String(body?.time ?? "").trim();
  const venue = String(body?.venue ?? "").trim();
  const price = Number(body?.price);
  const ticketsLabel = String(body?.ticketsLabel ?? "TICKETS LIVE").trim();
  const status = String(body?.status ?? "LIVE").toUpperCase();
  const capacity = Number(body?.capacity) || 400;
  const description = String(body?.description ?? "").trim();
  const image = String(body?.image ?? "").trim();

  if (!name) return Response.json({ error: "Name is required." }, { status: 400 });
  if (!city) return Response.json({ error: "City is required." }, { status: 400 });
  if (!date) return Response.json({ error: "Date is required." }, { status: 400 });
  if (!Number.isFinite(price) || price < 0) {
    return Response.json({ error: "Enter a valid price." }, { status: 400 });
  }
  if (!VALID_STATUSES.has(status)) return Response.json({ error: "Invalid status." }, { status: 400 });

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  if (!slug) return Response.json({ error: "Enter a valid name." }, { status: 400 });

  const existing = await prisma.event.findUnique({ where: { slug } });
  if (existing) return Response.json({ error: "An event with this name already exists." }, { status: 409 });

  const count = await prisma.event.count();
  const tint = TINTS[count % TINTS.length];

  const event = await prisma.event.create({
    data: { slug, name, city, date, cat, tint, time, venue, price, ticketsLabel, status, capacity, description, image },
  });

  return Response.json(event);
}

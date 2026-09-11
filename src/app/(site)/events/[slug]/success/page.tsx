import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getEventBySlug } from "@/lib/events";
import SuccessClient from "@/components/SuccessClient";

export default async function SuccessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  return (
    <Suspense fallback={null}>
      <SuccessClient event={event} />
    </Suspense>
  );
}

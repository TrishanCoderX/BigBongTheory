import { Suspense } from "react";
import StaffLoginClient from "@/components/StaffLoginClient";

export default function StaffLoginPage() {
  return (
    <Suspense fallback={null}>
      <StaffLoginClient />
    </Suspense>
  );
}

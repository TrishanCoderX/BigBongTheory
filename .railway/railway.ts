import { defineRailway, project, service } from "railway/iac";

// Last resort for a per-service CaC repo. Prefer one .railway file for the
// project and drop this if you later combine services into that file.
export const partial = "BigBongTheory";

export default defineRailway(() => {
  const BigBongTheory = service("BigBongTheory", {
    start: "npx prisma migrate deploy && npm run start",
    // builder from CaC: "NIXPACKS"
  });
  return project("easygoing-freedom", {
    resources: [BigBongTheory],
  });
});

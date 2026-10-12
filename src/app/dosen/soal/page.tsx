import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { SoalManager } from "@/components/dosen/SoalManager";

export default async function DosenSoalPage() {
  // FR-02: hanya instructor yang boleh mengelola soal
  const user = await getCurrentUser();
  if (!user || user.role !== "instructor") {
    redirect("/login");
  }

  return <SoalManager />;
}

import type { Metadata } from "next";
import { AuditView } from "@/components/AuditView";

// Audit results are for the person who requested them, not for search indexes.
export const metadata: Metadata = { title: "Your AI visibility snapshot", robots: { index: false, follow: false } };

export default async function AuditResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AuditView id={id} />;
}

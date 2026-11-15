import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="text-4xl font-semibold">Page not found</h1>
      <p className="mt-3 text-lg">That page doesn&apos;t exist.</p>
      <Link href="/" className="btn-primary mt-8">Back to the homepage</Link>
    </div>
  );
}

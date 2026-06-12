import { Suspense } from "react";
import AddProductClient from "./AddProductClient";

export default async function AddProductPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const id = resolvedSearchParams?.id;

  return (
    <Suspense fallback={<div className="container">Loading product form...</div>}>
      <AddProductClient id={id} />
    </Suspense>
  );
}

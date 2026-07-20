import ResetPasswordForm from "../components/ResetPasswordForm";

// Thin wrapper page that passes the reset token into the form component.
export default async function ResetPasswordPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  return <ResetPasswordForm token={resolvedSearchParams?.token || ""} />;
}

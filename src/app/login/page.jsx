import AuthForm from "../components/AuthForm";

// Login route reuses the shared auth form in login mode.
export default async function LoginPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  return <AuthForm mode="login" nextPath={resolvedSearchParams?.next || "/"} />;
}

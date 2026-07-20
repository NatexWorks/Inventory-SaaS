import AuthForm from "../components/AuthForm";

// Signup route reuses the same auth form but switches it into signup mode.
export default async function SignupPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  return <AuthForm mode="signup" nextPath={resolvedSearchParams?.next || "/"} />;
}

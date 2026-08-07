import { signIn } from "@/auth";
import SignInClient from "./SignInClient";

export const metadata = {
  title: '🔐 Sign In — Dockeryze',
  description: 'Sign in to Dockeryze with 2-Factor OTP authentication.',
};

export default function SignInPage() {
  const handleGoogleSignIn = async () => {
    "use server";
    await signIn("google", { redirectTo: "/" });
  };

  const handleGitHubSignIn = async () => {
    "use server";
    await signIn("github", { redirectTo: "/" });
  };

  const handleCredentialsSignIn = async (username, password) => {
    "use server";
    await signIn("credentials", { username, password, redirectTo: "/" });
  };

  return (
    <div className="app">
      {/* Moving Ambient Background Orbs */}
      <div className="bg-orbs" aria-hidden="true">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      <main className="signin-page">
        <SignInClient
          handleGoogleSignIn={handleGoogleSignIn}
          handleGitHubSignIn={handleGitHubSignIn}
          handleCredentialsSignIn={handleCredentialsSignIn}
        />
      </main>
    </div>
  );
}

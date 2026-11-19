
import SignInPage from "@/app/sign-in/page";

// Reusable modal wrapper।
import AuthModal from "@/components/auth/AuthModal";
export default function SignInModalPage() {
  return (
    <AuthModal title="Sign In">
      <SignInPage />
    </AuthModal>
  );
}
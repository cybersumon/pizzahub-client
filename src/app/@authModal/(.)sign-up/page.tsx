import SignUpPage from "@/app/sign-up/page";

// Shared modal design।
import AuthModal from "@/components/auth/AuthModal";
export default function SignUpModalPage() {
  return (
    <AuthModal title="Create Account">
      <SignUpPage />
    </AuthModal>
  );
}
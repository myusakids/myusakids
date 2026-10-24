import Link from "next/link";
import { getStateConfig } from "@/lib/state-context";
import SignInForm from "./SignInForm";

export default function SignInPage() {
  const { siteName } = getStateConfig();
  const brandPrefix = siteName.replace(/Kids$/, "");

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-brand-green font-bold text-2xl">
              {brandPrefix}<span className="text-brand-green-dark">Kids</span>
            </span>
          </Link>
          <p className="text-xs text-gray-400 mt-1">For business owners and admins</p>
        </div>

        <SignInForm />

        <p className="text-center text-xs text-gray-400 mt-6">
          <Link href="/" className="hover:text-brand-green transition-colors">
            ← Back to {siteName}
          </Link>
        </p>
      </div>
    </div>
  );
}

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { AxiosError } from "axios";

import { authService } from "../services/auth.service";

type VerificationStatus = "loading" | "success" | "error";

/**
 * A React component that handles email verification page functionality.
 * Displays verification status and appropriate UI based on the verification result.
 *
 * @component
 * @example
 * // Usage in routing
 * <Route path="/verify-email" element={<VerifyEmailPage />} />
 */
export const VerifyEmailPage = () => {
  /**
   * URL search parameters from the current location.
   * Used to extract the verification token.
   */
  const [searchParams] = useSearchParams();

  /**
   * Navigation function from react-router.
   * Used to redirect users after verification.
   */
  const navigate = useNavigate();

  /**
   * Verification token extracted from URL parameters.
   * @type {string | null}
   */
  const token = searchParams.get("token");

  /**
   * Current verification status state.
   * @type {VerificationStatus}
   * @default "loading" if token exists, otherwise "error"
   */
  const [status, setStatus] = useState<VerificationStatus>(
    token ? "loading" : "error",
  );

  /**
   * Message displayed to the user based on verification status.
   * @type {string}
   */
  const [message, setMessage] = useState(
    token
      ? "Verifying your email..."
      : "Invalid link: Missing verification token.",
  );

  /**
   * Ref to prevent multiple verification attempts.
   * @type {React.MutableRefObject<boolean>}
   */
  const processedRef = useRef(false);

  /**
   * Effect hook to handle email verification process.
   * Runs once when component mounts if token is present.
   */
  useEffect(() => {
    if (processedRef.current || !token) return;
    processedRef.current = true;

    /**
     * Asynchronous function to verify email with the provided token.
     * Updates status and message based on verification result.
     */
    const verify = async () => {
      try {
        await authService.verifyEmail(token);
        setStatus("success");
        setMessage(
          "Email verified successfully! You can now access your account.",
        );
      } catch (error) {
        setStatus("error");
        if (error instanceof AxiosError && error.response) {
          setMessage(error.response.data.message || "Verification failed.");
        } else {
          setMessage("An unexpected error occurred. Please try again.");
        }
      }
    };

    verify();
  }, [token]);

  /**
   * Renders appropriate icon based on verification status.
   * @returns {JSX.Element} The status icon component
   */
  const renderIcon = () => {
    switch (status) {
      case "loading":
        return (
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
        );
      case "success":
        return <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />;
      case "error":
        return <XCircle className="mx-auto h-12 w-12 text-red-600" />;
    }
  };

  /**
   * Renders appropriate title based on verification status.
   * @returns {string} The status title
   */
  const renderTitle = () => {
    switch (status) {
      case "loading":
        return "Verifying...";
      case "success":
        return "You're all set!";
      case "error":
        return "Verification Failed";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
        <div className="p-8 text-center">
          <div className="mb-6 flex justify-center">{renderIcon()}</div>

          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {renderTitle()}
          </h1>

          <p className="mb-8 leading-relaxed text-gray-600">{message}</p>

          <div className="space-y-3">
            {status === "success" && (
              <button
                onClick={() => navigate("/auth")}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 font-medium text-white transition-colors hover:bg-gray-800"
              >
                Go to Login <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {status === "error" && (
              <button
                onClick={() => navigate("/auth")}
                className="cursor-pointer text-sm text-gray-500 underline transition-colors hover:text-gray-900"
              >
                Back to Sign Up
              </button>
            )}
          </div>
        </div>

        {status === "loading" && (
          <div className="h-1 w-full bg-blue-100">
            <div className="animate-progress h-1 w-1/3 bg-blue-600"></div>
          </div>
        )}
      </div>
    </div>
  );
};

import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import * as Sentry from "@sentry/react";
import { router } from "./router";
import { AuthLoader } from "@/features/auth/components/AuthLoader";
import { ThemeManager } from "@/features/theme/components/ThemeManager";
import { Button } from "@/components/ui/button";

// CORRECTION 1 : On utilise 'unknown' au lieu de 'any' pour satisfaire ESLint
interface FallbackProps {
  error: unknown;
  resetError: () => void;
}

function ErrorFallback({ error, resetError }: FallbackProps) {
  const errorMessage =
    error instanceof Error ? error.message : "An unexpected error occurred.";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h2 className="mb-4 text-2xl font-bold text-red-600">
        Something went wrong.
      </h2>
      <p className="text-muted-foreground mb-6 max-w-md">{errorMessage}</p>
      <Button onClick={resetError} variant="outline">
        Try again
      </Button>
    </div>
  );
}

function App() {
  return (
    <Sentry.ErrorBoundary fallback={ErrorFallback} showDialog>
      <ThemeManager />
      <AuthLoader />
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </Sentry.ErrorBoundary>
  );
}

export default App;

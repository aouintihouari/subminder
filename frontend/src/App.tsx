import { RouterProvider } from "react-router";
import { Toaster } from "sonner";

import { router } from "./router";
import { AuthLoader } from "@/features/auth/components/AuthLoader";
import { ThemeManager } from "@/features/theme/components/ThemeManager";

function App() {
  return (
    <>
      <ThemeManager />
      <AuthLoader />
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;

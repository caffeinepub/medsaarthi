import { Toaster } from "@/components/ui/sonner";
import { AppProvider } from "@/context/AppContext";
import { CaregiverDashboard } from "@/pages/CaregiverDashboard";
import { DemoMode } from "@/pages/DemoMode";
import { HealthCheckin } from "@/pages/HealthCheckin";
import { Home } from "@/pages/Home";
import { Medicines } from "@/pages/Medicines";
import { Profile } from "@/pages/Profile";
import { Register } from "@/pages/Register";
import { Reminders } from "@/pages/Reminders";
import { ScanPrescription } from "@/pages/ScanPrescription";
import { VerifyMedicine } from "@/pages/VerifyMedicine";
import { Welcome } from "@/pages/Welcome";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => (
    <AppProvider>
      <Outlet />
      <Toaster />
    </AppProvider>
  ),
});

const welcomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Welcome,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: Register,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/home",
  component: Home,
});

const medicinesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/medicines",
  component: Medicines,
});

const scanRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/scan-prescription",
  component: ScanPrescription,
});

const verifyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/verify-medicine",
  component: VerifyMedicine,
});

const remindersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reminders",
  component: Reminders,
});

const checkinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkin",
  component: HealthCheckin,
});

const caregiverRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/caregiver",
  component: CaregiverDashboard,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: Profile,
});

const demoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/demo",
  component: DemoMode,
});

const routeTree = rootRoute.addChildren([
  welcomeRoute,
  registerRoute,
  homeRoute,
  medicinesRoute,
  scanRoute,
  verifyRoute,
  remindersRoute,
  checkinRoute,
  caregiverRoute,
  profileRoute,
  demoRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}

import { createBrowserRouter } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { ParentDashboard } from "./pages/ParentDashboard";
import { ChildDashboard } from "./pages/ChildDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "login", Component: LoginPage },
      { path: "parent", Component: ParentDashboard },
      { path: "child", Component: ChildDashboard },
    ],
  },
]);

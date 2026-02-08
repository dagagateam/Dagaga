import React, { Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import App from "../App";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ProtectedRoute from "../components/common/ProtectedRoute";

// Lazy Load Pages
const ScenarioSelect = React.lazy(() => import("../pages/ScenarioSelect/ScenarioSelect"));
const ProblemSelect = React.lazy(() => import("../pages/ProblemSelect/ProblemSelect"));
const Problem = React.lazy(() => import("../pages/Problem/Problem"));
const Login = React.lazy(() => import("../pages/Login/Login"));
const Signup = React.lazy(() => import("../pages/Signup/Signup"));
const CommunityInfo = React.lazy(() => import("../pages/Community/Info/CommunityInfo"));
const CommunityInfoDetail = React.lazy(() => import("../pages/Community/Info/CommunityInfoDetail"));
const CommunityChatList = React.lazy(() => import("../pages/Community/Chat/CommunityChatList"));
const CommunityChatRoom = React.lazy(() => import("../pages/Community/Chat/CommunityChatRoom"));
const ProblemNative = React.lazy(() => import("../pages/ProblemNative/ProblemNative"));
const MyPage = React.lazy(() => import("../pages/MyPage/MyPage"));
const MyPageEdit = React.lazy(() => import("../pages/MyPageEdit/MyPageEdit"));
const AuthSuccess = React.lazy(() => import("../pages/Login/AuthSuccess"));
const SocialSignup = React.lazy(() => import("../pages/Signup/SocialSignup"));
const Homepage = React.lazy(() => import("../pages/Homepage/Homepage"));
const NotFound = React.lazy(() => import("../pages/Error/NotFound"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/Homepage" replace />,
      },
      {
        path: "Login",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: "Signup",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Signup />
          </Suspense>
        ),
      },
      {
        path: "Signup/Social",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <SocialSignup />
          </Suspense>
        ),
      },
      {
        path: "Homepage",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Homepage />
          </Suspense>
        ),
      },
      {
        path: "Auth/Success",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AuthSuccess />
          </Suspense>
        ),
      },
      // Protected Routes
      {
        element: (
          <ProtectedRoute>
            <Outlet />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "ScenarioSelect",
            element: <ScenarioSelect />,
          },
          {
            path: "ProblemSelect/:categoryId",
            element: <ProblemSelect />,
          },
          {
            path: "Problem/:categoryId/:questionId",
            element: <Problem />,
          },
          {
            path: "Community/Info",
            element: <CommunityInfo />,
          },
          {
            path: "Community/Info/:id",
            element: <CommunityInfoDetail />,
          },
          {
            path: "ProblemTranslate/:categoryId/:problemId",
            element: <ProblemNative />,
          },
          {
            path: "Community/Chat",
            element: <CommunityChatList />,
          },
          {
            path: "Community/Chat/room/:id",
            element: <CommunityChatRoom />,
          },
          {
            path: "MyPage",
            element: <MyPage />,
          },
          {
            path: "MyPage/Edit",
            element: <MyPageEdit />,
          },
        ],
      },
      // Catch-all route inside App for pages that should have Navbar
      {
        path: "*",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <NotFound />
          </Suspense>
        ),
      },
    ],
  },
]);

export default router;

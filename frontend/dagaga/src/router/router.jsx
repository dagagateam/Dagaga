import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import ScenarioSelect from "../pages/ScenarioSelect/ScenarioSelect";
import ProblemSelect from "../pages/ProblemSelect/ProblemSelect";
import Problem from "../pages/Problem/Problem";
import Login from "../pages/Login/Login";
import Signup from "../pages/Signup/Signup";
import CommunityInfo from "../pages/Community/Info/CommunityInfo";
import CommunityInfoDetail from "../pages/Community/Info/CommunityInfoDetail";
import CommunityChatList from "../pages/Community/Chat/CommunityChatList";
import CommunityChatRoom from "../pages/Community/Chat/CommunityChatRoom";
import ProblemNative from "../pages/ProblemNative/ProblemNative";
import MyPage from "../pages/MyPage/MyPage";
import MyPageEdit from "../pages/MyPageEdit/MyPageEdit";
import AuthSuccess from "../pages/Login/AuthSuccess";
import SocialSignup from "../pages/Signup/SocialSignup";
import Homepage from "../pages/Homepage/Homepage";
import ProtectedRoute from "../components/common/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/Login" replace />,
  },
  {
    path: "/Login",
    element: <Login />,
  },
  {
    path: "/Auth/Success",
    element: <AuthSuccess />,
  },
  {
    path: "/Signup",
    element: <Signup />,
  },
  {
    path: "/Signup/Social",
    element: <SocialSignup />,
  },
  {
    element: <App />,
    children: [
      {
        path: "ScenarioSelect",
        element: (
          <ProtectedRoute>
            <ScenarioSelect />
          </ProtectedRoute>
        ),
      },
      {
        path: "Homepage",
        element: <Homepage />,
      },
      {
        path: "ProblemSelect/:categoryId",
        element: (
          <ProtectedRoute>
            <ProblemSelect />
          </ProtectedRoute>
        ),
      },
      {
        path: "Problem/:categoryId/:questionId",
        element: (
          <ProtectedRoute>
            <Problem />
          </ProtectedRoute>
        ),
      },
      {
        path: "Community/Info",
        element: (
          <ProtectedRoute>
            <CommunityInfo />
          </ProtectedRoute>
        ),
      },
      {
        path: "Community/Info/:id",
        element: (
          <ProtectedRoute>
            <CommunityInfoDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "ProblemTranslate/:categoryId/:problemId",
        element: (
          <ProtectedRoute>
            <ProblemNative />
          </ProtectedRoute>
        ),
      },
      {
        path: "Community/Chat",
        element: (
          <ProtectedRoute>
            <CommunityChatList />
          </ProtectedRoute>
        ),
      },
      {
        path: "Community/Chat/room/:id",
        element: (
          <ProtectedRoute>
            <CommunityChatRoom />
          </ProtectedRoute>
        ),
      },
      {
        path: "MyPage",
        element: (
          <ProtectedRoute>
            <MyPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "MyPage/Edit",
        element: (
          <ProtectedRoute>
            <MyPageEdit />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;

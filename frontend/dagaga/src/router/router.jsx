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
]);

export default router;

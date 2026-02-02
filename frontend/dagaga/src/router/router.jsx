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
import MyPage from "../pages/my-page/MyPage";
import MyPageEdit from "../pages/MyPageEdit/MyPageEdit";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    element: <App />,
    children: [
      {
        path: "scenario-select",
        element: <ScenarioSelect />,
      },
      {
        path: "problem-select/:categoryId",
        element: <ProblemSelect />,
      },
      {
        path: "problem/:categoryId/:questionId",
        element: <Problem />,
      },
      {
        path: "community/info",
        element: <CommunityInfo />,
      },
      {
        path: "community/info/:id",
        element: <CommunityInfoDetail />,
      },
      {
        path: "problem-translate/:categoryId/:problemId",
        element: <ProblemNative />,
      },
      {
        path: "community/chat",
        element: <CommunityChatList />,
      },
      {
        path: "community/chat/room/:id",
        element: <CommunityChatRoom />,
      },
      {
        path: "my-page",
        element: <MyPage />,
      },
      {
        path: "my-page/edit",
        element: <MyPageEdit />,
      },
      {
        path: "my-page",
        element: <MyPage />,
      },
      {
        path: "my-page/edit",
        element: <MyPageEdit />,
      },
    ],
  },
]);

export default router;

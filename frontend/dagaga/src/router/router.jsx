import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import ScenarioSelect from "../pages/Scenario-Select/Scenario-select";
import ProblemSelect from "../pages/Problem-Select/Problem-select";
import Problem from "../pages/Problem/Problem";
import Login from "../pages/Login/Login";
import Signup from "../pages/Signup/Signup";
import CommunityInfo from "../pages/Community/Info/CommunityInfo";
import CommunityInfoDetail from "../pages/Community/Info/CommunityInfoDetail";
import CommunityChatList from "../pages/Community/Chat/CommunityChatList";
import CommunityChatRoom from "../pages/Community/Chat/CommunityChatRoom";
import ProblemNative from "../pages/problem-native/problem-native";

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
                path: "problem/:problemId",
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
                path: "problem-translate/:problemId",
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
        ],
    },
]);

export default router;


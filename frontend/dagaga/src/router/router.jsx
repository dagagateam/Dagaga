import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import ScenarioSelect from "../pages/Scenario-Select/Scenario-select";
import ProblemSelect from "../pages/Problem-Select/Problem-select";
import Problem from "../pages/Problem/Problem";
import Login from "../pages/Login/Login";
import Signup from "../pages/Signup/Signup";

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
        ],
    },
]);

export default router;


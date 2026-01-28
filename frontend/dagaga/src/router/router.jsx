import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import ScenarioSelect from "../pages/Scenario-Select/Scenario-select";
import Login from "../pages/Login/Login";

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
        element: <App />,
        children: [
            {
                path: "scenario-select",
                element: <ScenarioSelect />,
            },
        ],
    },
]);

export default router;

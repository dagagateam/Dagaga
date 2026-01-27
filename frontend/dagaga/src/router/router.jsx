import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import ScenarioSelect from "../pages/Scenario-Select/Scenario-select";

const router = createBrowserRouter([
  {
    path: "/",
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

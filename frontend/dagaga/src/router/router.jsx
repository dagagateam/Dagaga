import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import ScenarioSelect from "../pages/Scenario-Select/Scenario-select";
import ProblemSelect from "../pages/Problem-Select/Problem-select";

const router = createBrowserRouter([
  {
    path: "/",
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
    ],
  },
]);

export default router;

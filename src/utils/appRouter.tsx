import CreateQr from "@pages/CreateQr";
import Home from "@pages/Home";
import ImagesHistory from "@pages/ImagesHistory";
import Layout from "@pages/Layout";
import Settings from "@pages/Settings";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
} from "react-router-dom";
const AppRouters = createRoutesFromElements([
  <Route path="/" element={<Layout />}>
    <Route index element={<Home />} />
    <Route key="qr" path="/qr" element={<CreateQr />} />
    <Route key="images" path="/images" element={<ImagesHistory />} />
    <Route key="settings" path="/settings" element={<Settings />} />
    <Route key="not-found" path="*" element={<Navigate to="/" />} />
  </Route>,
]);

const AppRouter = createBrowserRouter(AppRouters);

export default AppRouter;

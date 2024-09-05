import CreateQr from "@pages/createQr";
import Home from "@pages/Home";
import ImagesHistory from "@pages/imagesHistory";
import Layout from "@pages/layout";
import Settings from "@pages/settings";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
const AppRouters = createRoutesFromElements([
  <Route path="/" element={<Layout />}>
    <Route index element={<Home />} />
    <Route key="qr" path="/qr" element={<CreateQr />} />
    <Route key="images" path="/images" element={<ImagesHistory />} />
    <Route key="settings" path="/settings" element={<Settings />} />
  </Route>,
]);

const AppRouter = createBrowserRouter(AppRouters);

export default AppRouter;

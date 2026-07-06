import { BrowserRouter, Routes, Route } from "react-router-dom";
import Body from "./components/Body";
import Home from "./components/Home";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import Profile from "./components/Profile";
import { Provider } from "react-redux";
import appStore from "./utils/appStore";
import Feed from "./components/Feed";
import Connections from "./components/Connections";
import Requests from "./components/Requests";
import Premium from "./components/Premium";
import Chat from "./components/Chat";
import Notifications from "./components/Notifications";
import { useState } from "react";

function App() {
  // ✅ Global dark mode state
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );


  return (
    <Provider store={appStore}>
      <BrowserRouter basename="/">
  <Routes>
    <Route
      path="/"
      element={<Body darkMode={darkMode} setDarkMode={setDarkMode} />}
    >
      <Route index element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<Login />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="feed" element={<Feed />} />
      <Route path="profile" element={<Profile />} />
      <Route path="connections" element={<Connections />} />
      <Route path="requests" element={<Requests />} />
      <Route path="notifications" element={<Notifications />} />
      <Route path="premium" element={<Premium />} />
      <Route path="chat/:targetUserId" element={<Chat />} />
    </Route>
  </Routes>
</BrowserRouter>
    </Provider>
  );
}

export default App;

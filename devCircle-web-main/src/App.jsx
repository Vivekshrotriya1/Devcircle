import { BrowserRouter, Routes, Route } from "react-router-dom";
import Body from "./components/Body";
import Login from "./components/Login";
import Profile from "./components/Profile";
import { Provider } from "react-redux";
import appStore from "./utils/appStore";
import Feed from "./components/Feed";
import Connections from "./components/Connections";
import Requests from "./components/Requests";
import Premium from "./components/Premium";
import Chat from "./components/Chat";
import { useState, useEffect } from "react";

function App() {
  // ✅ Global dark mode state
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // // ✅ Apply theme to whole app
  // useEffect(() => {
  //   if (darkMode) {
  //     document.documentElement.classList.add("dark");
  //     localStorage.setItem("theme", "dark");
  //   } else {
  //     document.documentElement.classList.remove("dark");
  //     localStorage.setItem("theme", "light");
  //   }
  // }, [darkMode]);

  return (
    <Provider store={appStore}>
      <BrowserRouter basename="/">
  <Routes>
    <Route
      path="/"
      element={<Body darkMode={darkMode} setDarkMode={setDarkMode} />}
    >
      {/* <Route index element={<Feed />} /> */}
      <Route path="login" element={<Login />} />
      <Route path="profile" element={<Profile />} />
      <Route path="connections" element={<Connections />} />
      <Route path="requests" element={<Requests />} />
      <Route path="premium" element={<Premium />} />
      <Route path="chat/:targetUserId" element={<Chat />} />
    </Route>
  </Routes>
</BrowserRouter>
    </Provider>
  );
}

export default App;
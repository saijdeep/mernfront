import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import store from "./utils/appStore";
import NavBar from "./components/NavBar";
import Body from "./components/Body";
import Login from "./components/Login";
import Feed from "./components/Feed";
import Connections from "./components/connections";
import Requests from "./components/Requests";
import Profile from "./components/Profile";
import Community from "./components/Community";
import Chat from "./components/Chat";
import Welcome from "./components/Welcome";
import PublicProfile from "./components/PublicProfile";
import ChatList from "./components/ChatList";
import { createContext, useState, useEffect } from "react";
import io from "socket.io-client";
import Cookies from "js-cookie";
import { BASE_URL } from "./utils/constants";

export const NotificationContext = createContext();

function NotificationProvider({ children }) {
  const user = useSelector((state) => state.user);
  const [notifications, setNotifications] = useState({ chat: 0, requests: 0, posts: 0 });
  useEffect(() => {
    if (!user || !user._id) return; // Only connect if logged in
    // Fetch initial requests count
    fetch(`${BASE_URL}/user/requests/received`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setNotifications(n => ({ ...n, requests: Array.isArray(data.data) ? data.data.length : 0 })))
      .catch(() => setNotifications(n => ({ ...n, requests: 0 })));
    // Fetch initial chat unread count (requires backend endpoint)
    fetch(`${BASE_URL}/chat/unread`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setNotifications(n => ({ ...n, chat: data.unreadCount || 0 })))
      .catch(() => setNotifications(n => ({ ...n, chat: 0 })));
    const token = Cookies.get("token");
    const socket = io(BASE_URL, { auth: { token }, withCredentials: true });
    socket.on("new_message", () => setNotifications(n => ({ ...n, chat: n.chat + 1 })));
    socket.on("new_request", () => setNotifications(n => ({ ...n, requests: n.requests + 1 })));
    socket.on("new_post", () => setNotifications(n => ({ ...n, posts: n.posts + 1 })));
    return () => socket.disconnect();
  }, [user && user._id]);
  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

function RequireAuth({ children }) {
  const user = useSelector((state) => state.user);
  if (!user || !user._id) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppRoutes() {
  const user = useSelector((state) => state.user);
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route
        path="/"
        element={
          user && user._id ? <Navigate to="/feed" replace /> : <Navigate to="/welcome" replace />
        }
      />
      <Route
        path="/feed"
        element={
          <RequireAuth>
            <Feed />
          </RequireAuth>
        }
      />
      <Route
        path="/connections"
        element={
          <RequireAuth>
            <Connections />
          </RequireAuth>
        }
      />
      <Route
        path="/requests"
        element={
          <RequireAuth>
            <Requests />
          </RequireAuth>
        }
      />
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        }
      />
      <Route
        path="/community"
        element={
          <RequireAuth>
            <Community />
          </RequireAuth>
        }
      />
      <Route
        path="/chat"
        element={
          <RequireAuth>
            <ChatList />
          </RequireAuth>
        }
      />
      <Route
        path="/chat/:userId"
        element={
          <RequireAuth>
            <Chat />
          </RequireAuth>
        }
      />
      <Route
        path="/profile/:userId"
        element={
          <RequireAuth>
            <PublicProfile />
          </RequireAuth>
        }
      />
      {/* Fallback: redirect unknown routes to / */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <NotificationProvider>
          <NavBar />
          <AppRoutes />
        </NotificationProvider>
      </BrowserRouter>
    </Provider>
  );
}

export default App;

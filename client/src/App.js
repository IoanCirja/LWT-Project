import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import LoginPage from "./Login.jsx";
import SignupPage from "./Signup.jsx";
import BookExplorer from "./BookExplorer.jsx";
import ProfilePage from "./ProfilePage.jsx";
import AdminPage from "./AdminPage.jsx";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

const getUser = () => JSON.parse(localStorage.getItem("user"));

export default function App() {
  const [user, setUser] = useState(getUser());

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            !user ? <LoginPage setUser={setUser} /> : <Navigate to="/" />
          }
        />

        <Route
          path="/signup"
          element={
            !user ? <SignupPage setUser={setUser} /> : <Navigate to="/" />
          }
        />

        <Route
          path="/"
          element={
            user ? (
              <BookExplorer user={user} setUser={setUser} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/profile"
          element={
            user ? <ProfilePage user={user} /> : <Navigate to="/login" />
          }
        />

        <Route
          path="/admin"
          element={
            user?.id_reader === "8888" ? (
              <AdminPage user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

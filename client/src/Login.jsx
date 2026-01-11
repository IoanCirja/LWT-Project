import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { LOGIN_MUTATION } from "./mutations.js";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

const saveUser = (user) => localStorage.setItem("user", JSON.stringify(user));

function LoginPage({ setUser }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();
  const [login, { loading, error }] = useMutation(LOGIN_MUTATION);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await login({ variables: form });
      if (data.login) {
        saveUser(data.login);
        setUser(data.login);
        navigate("/");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={authContainerStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h2>📚 BookApp Login</h2>
        <input
          style={inputStyle}
          placeholder="Username"
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          style={inputStyle}
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button style={navButtonStyle} type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && (
          <p style={{ color: "red", marginTop: "10px" }}>{error.message}</p>
        )}
      </form>
    </div>
  );
}

const authContainerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  backgroundColor: "#eee",
};
const formStyle = {
  background: "white",
  padding: "30px",
  borderRadius: "8px",
  width: "300px",
  textAlign: "center",
};
const inputStyle = {
  width: "100%",
  marginBottom: "10px",
  padding: "8px",
  boxSizing: "border-box",
};
const navButtonStyle = {
  padding: "8px 15px",
  background: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

export default LoginPage;

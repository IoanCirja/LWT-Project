import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { REGISTER_MUTATION } from "./mutations.js";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

const saveUser = (user) => localStorage.setItem("user", JSON.stringify(user));

function SignupPage({ setUser }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
    pfp: "",
  });

  const navigate = useNavigate();
  const [register, { loading, error }] = useMutation(REGISTER_MUTATION);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await register({ variables: form });
      if (data.register) {
        saveUser(data.register);
        setUser(data.register);
        navigate("/");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={authContainerStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h2>📝 Create Account</h2>

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

        <input
          style={inputStyle}
          placeholder="Profile picture URL (optional)"
          onChange={(e) => setForm({ ...form, pfp: e.target.value })}
        />

        <button style={navButtonStyle} type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign up"}
        </button>

        {error && <p style={{ color: "red" }}>{error.message}</p>}

        <p style={{ marginTop: "10px" }}>
          Already have an account?{" "}
          <span
            style={{ color: "#007bff", cursor: "pointer" }}
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
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

export default SignupPage;

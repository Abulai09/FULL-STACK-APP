import React, { useState } from "react";
import "../../App.css";
import { useDispatch } from "react-redux";
import { login } from "../../api/auth";

export default function Login() {
  let [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();

  const handleSubmit = async (event) => {
    try {
      event.preventDefault();
      dispatch(login(name, password));
      alert("logged");
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="subtitle">Login to continue</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="username"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="primary-btn">Login</button>
        </form>

        <div className="switch-text">Forgot your password?</div>
      </div>
    </div>
  );
}

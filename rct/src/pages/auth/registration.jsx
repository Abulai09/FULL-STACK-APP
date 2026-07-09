import { useState } from "react";
import "../../App.css";
import { useDispatch } from "react-redux";
import { registration } from "../../api/auth";

export default function Registration(props) {
  const [name, setName] = useState("");
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();

  const handleSubmit = async (event) => {
    event.preventDefault();
    dispatch(registration(name, email, password));
    alert("logged");
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Registration</h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="name"
            className="input"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setemail(e.target.value)}
            placeholder="Email"
            className="input"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="input"
          />

          <button className="primary-btn">Sign in</button>
        </form>
      </div>
    </div>
  );
}

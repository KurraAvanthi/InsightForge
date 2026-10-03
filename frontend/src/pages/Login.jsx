import { useState } from "react";
import AuthLayout from "../components/AuthLayout";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    // Temporary frontend-only login
    window.location.href = "/";
  };

  return (
    <AuthLayout>
      <div className="auth-card">

        {/* Header */}

        <div className="auth-header">
          <p className="auth-label">
            WELCOME BACK
          </p>

          <h1>
            Sign in to InsightForge
          </h1>

          <p>
            Access your marketing intelligence
            dashboard.
          </p>
        </div>

        {/* Login Form */}

        <form
          className="auth-form"
          onSubmit={handleLogin}
        >

          {/* Email */}

          <div className="form-group">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              placeholder="you@example.com"
              autoComplete="email"
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              required
            />

          </div>

          {/* Password */}

          <div className="form-group">

            <div className="password-label-row">

              <label htmlFor="password">
                Password
              </label>

              <button
                type="button"
                className="auth-link-button"
                onClick={() => {
                  window.location.href =
                    "/forgot-password";
                }}
              >
                Forgot password?
              </button>

            </div>

            <div className="password-input-wrapper">

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                placeholder="Enter your password"
                autoComplete="current-password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>

          </div>

          {/* Error */}

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {/* Submit */}

          <button
            type="submit"
            className="auth-submit-button"
          >
            Sign In
          </button>

        </form>

        {/* Divider */}

        <div className="auth-divider">
          <span>OR</span>
        </div>

        {/* Signup */}

        <p className="auth-switch">
          Don't have an account?

          <button
            type="button"
            className="auth-link-button signup-link"
            onClick={() => {
              window.location.href =
                "/signup";
            }}
          >
            Create account
          </button>
        </p>

      </div>
    </AuthLayout>
  );
}

export default Login;
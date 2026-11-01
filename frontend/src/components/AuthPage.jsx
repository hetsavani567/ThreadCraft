import { useMemo, useState, useEffect } from "react";
import {
  loginUser,
  registerUser,
  continueWithGoogle,
  saveAuthTokens,
  fetchUserSessions,
  revokeUserSession,
  logoutAllDevices,
} from "../services/api";

function AuthPage({ onNavigateToStore, currentUser, onLoginSuccess, onLogout, onNavigateAfterLogin, onCancelAuth }) {
  const [mode, setMode] = useState("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formErrors, setFormErrors] = useState({});

  // Sessions state for logged-in view
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionActionMsg, setSessionActionMsg] = useState("");

  const [signInData, setSignInData] = useState({ email: "", password: "", rememberMe: true });
  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    house_no: "",
    street: "",
    area: "",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "380001",
    emp_role: "Sales Associate",
    branch_id: 1,
    agreeTerms: true,
  });

  const demoUsers = {
    customer: { email: "customer@demo.com", password: "Customer123" },
    rahul: { email: "rahul.mehta@example.com", password: "Customer123" },
    priya: { email: "priya.shah@example.com", password: "Customer123" },
    employee: { email: "demo@thread.com", password: "Employee123" },
  };

  const isEmployeeEmail = (email) =>
    email.trim().toLowerCase().endsWith("@thread.com");

  // Load user sessions if logged in
  useEffect(() => {
    if (currentUser) {
      loadSessions();
    }
  }, [currentUser]);

  async function loadSessions() {
    setSessionsLoading(true);
    try {
      const res = await fetchUserSessions();
      if (res?.success && Array.isArray(res.sessions)) {
        setSessions(res.sessions);
      }
    } catch (err) {
      console.warn("Could not load sessions:", err);
    } finally {
      setSessionsLoading(false);
    }
  }

  async function handleRevokeSession(sessionId) {
    try {
      await revokeUserSession(sessionId);
      setSessionActionMsg("Session revoked successfully.");
      setTimeout(() => setSessionActionMsg(""), 3000);
      loadSessions();
    } catch (err) {
      alert("Failed to revoke session: " + err.message);
    }
  }

  async function handleLogoutAllDevices() {
    if (window.confirm("Are you sure you want to sign out from all devices? You will need to log in again.")) {
      try {
        await logoutAllDevices();
        onLogout();
      } catch (err) {
        alert("Failed to logout all: " + err.message);
      }
    }
  }

  function useDemoAccount(type) {
    const demo = demoUsers[type];
    setSignInData({ email: demo.email, password: demo.password, rememberMe: true });
    setFormErrors({});
    setSuccessMessage("");
    setShowPassword(false);
    setMode("signin");
  }

  const signupIsEmployee = useMemo(
    () => isEmployeeEmail(signUpData.email),
    [signUpData.email]
  );

  const branches = [
    { id: 1, name: "Surat Central" },
    { id: 2, name: "Ahmedabad West" },
    { id: 3, name: "Mumbai Andheri" },
  ];

  function changeMode(nextMode) {
    setMode(nextMode);
    setFormErrors({});
    setSuccessMessage("");
  }

  // Handle Standard Sign-in
  async function handleSignInSubmit(e) {
    e.preventDefault();
    const errors = {};
    const email = signInData.email.trim().toLowerCase();

    if (!email) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!signInData.password) errors.password = "Password is required.";

    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);
    setFormErrors({});
    setSuccessMessage("");

    try {
      const response = await loginUser({
        email,
        password: signInData.password,
      });

      if (response.success && response.user) {
        setSuccessMessage(response.message || `Welcome back, ${response.user.name}!`);
        setTimeout(() => {
          onLoginSuccess(response.user);
          if (onNavigateAfterLogin) {
            onNavigateAfterLogin(response.user);
          } else {
            onNavigateToStore();
          }
        }, 600);
      } else {
        setFormErrors({ submit: response.message || "Failed to sign in." });
      }
    } catch (err) {
      console.error("Login error:", err);
      const serverErr = err.data?.error ? `${err.data.message || "Login failed"}: ${err.data.error}` : (err.message || "Invalid email or password.");
      setFormErrors({ submit: serverErr });
    } finally {
      setIsLoading(false);
    }
  }

  // Handle Sign-up
  async function handleSignUpSubmit(e) {
    e.preventDefault();
    const errors = {};
    const email = signUpData.email.trim().toLowerCase();
    const cleanMobile = signUpData.mobile.replace(/\D/g, "");
    const employee = isEmployeeEmail(email);

    if (!signUpData.name.trim()) errors.name = "Full name is required.";
    if (!email) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!cleanMobile) {
      errors.mobile = "Mobile number is required.";
    } else if (cleanMobile.length !== 10) {
      errors.mobile = "Enter a valid 10-digit mobile number.";
    }

    if (!signUpData.password) errors.password = "Password is required.";
    else if (signUpData.password.length < 6) {
      errors.password = "Password must contain at least 6 characters.";
    }
    if (signUpData.password !== signUpData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (!employee) {
      const pincode = signUpData.pincode.trim();
      if (pincode && !/^\d{6}$/.test(pincode)) {
        errors.pincode = "Enter a valid 6-digit PIN code.";
      }
    }
    if (!signUpData.agreeTerms) errors.agreeTerms = "Please accept the terms to continue.";

    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);
    setFormErrors({});
    setSuccessMessage("");

    try {
      const response = await registerUser({
        ...signUpData,
        email,
        mobile: cleanMobile,
        city: signUpData.city?.trim() || "Ahmedabad",
        state: signUpData.state?.trim() || "Gujarat",
        pincode: signUpData.pincode?.trim() || "380001",
        role: employee ? "employee" : "customer",
      });

      if (response.success && response.user) {
        setSuccessMessage(response.message || `Account created successfully!`);
        setTimeout(() => {
          onLoginSuccess(response.user);
          if (onNavigateAfterLogin) {
            onNavigateAfterLogin(response.user);
          } else {
            onNavigateToStore();
          }
        }, 600);
      } else {
        setFormErrors({ submit: response.message || "Registration failed." });
      }
    } catch (err) {
      console.error("Registration error:", err);
      const field = err.data?.field;
      const msg = err.data?.message || err.message || "Registration failed.";
      if (field === "email") {
        setFormErrors({ email: msg, submit: msg });
      } else if (field === "mobile") {
        setFormErrors({ mobile: msg, submit: msg });
      } else {
        setFormErrors({ submit: msg });
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Handle Real Google OAuth 2.0 Permission Consent Flow
  function handleGoogleButtonClick() {
    setIsLoading(true);
    setFormErrors({});
    setSuccessMessage("");

    try {
      // Backend Google OAuth 2.0 authorization endpoint
      const authUrl = "http://localhost:5000/api/auth/google";

      // Open centered Google OAuth consent window
      const width = 520;
      const height = 650;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2.5;

      const popup = window.open(
        authUrl,
        "GooglePermissionConsent",
        `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`
      );

      if (!popup || popup.closed || typeof popup.closed === "undefined") {
        // If popup is blocked by the browser, navigate directly
        window.location.href = authUrl;
        return;
      }

      popup.focus();

      // Listen for approval callback from Google OAuth
      const messageHandler = (event) => {
        if (event.data?.type === "GOOGLE_AUTH_SUCCESS") {
          window.removeEventListener("message", messageHandler);
          const { user, accessToken, refreshToken, sessionId } = event.data.data;
          saveAuthTokens({ accessToken, refreshToken, sessionId });
          setSuccessMessage(`Signed in as ${user.name} via Google`);
          setTimeout(() => {
            onLoginSuccess(user);
            if (onNavigateAfterLogin) {
              onNavigateAfterLogin(user);
            } else {
              onNavigateToStore();
            }
          }, 500);
        }
      };

      window.addEventListener("message", messageHandler);
    } catch (err) {
      setFormErrors({ submit: err.message || "Failed to start Google sign in" });
    } finally {
      setIsLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-700 focus:ring-2 focus:ring-amber-100";
  const errorClass = "mt-1 text-xs text-red-600";

  // LOGGED IN USER PROFILE & SESSIONS VIEW
  if (currentUser) {
    return (
      <div className="min-h-screen bg-stone-50 px-4 py-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between border-b border-stone-100 pb-5">
            <div className="flex items-center gap-3">
              {currentUser.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.name}
                  className="w-14 h-14 rounded-full border-2 border-amber-600 object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-2xl font-bold">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : "👤"}
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-stone-900">{currentUser.name}</h2>
                <p className="text-xs text-stone-500">{currentUser.email}</p>
                <span className="mt-1 inline-block rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase text-stone-700">
                  {currentUser.role === "employee" ? `Staff (${currentUser.emp_role || "Employee"})` : "Customer Account"}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onNavigateToStore}
                className="rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-stone-700 transition"
              >
                Go to Shop
              </button>
              <button
                onClick={onLogout}
                className="rounded-xl border border-stone-300 px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-100 transition"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Active Sessions & Security Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <span>🔒</span> Active Sessions &amp; Devices
                </h3>
                <p className="text-xs text-stone-500">
                  Manage your active logins across different browsers and devices.
                </p>
              </div>
              <button
                onClick={handleLogoutAllDevices}
                className="text-xs font-semibold text-red-600 hover:text-red-800 transition"
              >
                Sign Out All Devices
              </button>
            </div>

            {sessionActionMsg && (
              <div className="mb-3 rounded-lg bg-green-50 p-2 text-xs text-green-700">
                {sessionActionMsg}
              </div>
            )}

            {sessionsLoading ? (
              <p className="text-xs text-stone-400 py-3">Loading active sessions...</p>
            ) : sessions.length === 0 ? (
              <p className="text-xs text-stone-400 py-3">No active sessions found.</p>
            ) : (
              <div className="space-y-2">
                {sessions.map((s) => (
                  <div
                    key={s.sessionId}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
                      s.isCurrent
                        ? "border-emerald-200 bg-emerald-50/60"
                        : "border-stone-200 bg-stone-50"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-800">
                          {s.deviceInfo || "Web Browser"}
                        </span>
                        {s.isCurrent ? (
                          <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold">
                            Current Device
                          </span>
                        ) : (
                          <span className="rounded-full bg-stone-200 text-stone-700 px-2 py-0.5 text-[10px]">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500">
                        IP: {s.ipAddress || "127.0.0.1"} • Last active:{" "}
                        {new Date(s.lastActiveAt || s.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {!s.isCurrent && (
                      <button
                        onClick={() => handleRevokeSession(s.sessionId)}
                        className="rounded-lg border border-red-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 transition"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // SIGN IN / SIGN UP AUTH INTERFACE
  return (
    <div className="min-h-screen bg-stone-50 px-4 py-8 flex flex-col items-center justify-center">
      <div className="mb-5 flex w-full max-w-md items-center justify-between">
        <button
          onClick={onCancelAuth || onNavigateToStore}
          className="text-sm font-medium text-stone-600 hover:text-stone-900 transition flex items-center gap-1 cursor-pointer"
        >
          ← Back
        </button>
        <button
          onClick={onNavigateToStore}
          className="text-xl font-bold tracking-tight text-stone-900"
        >
          THREAD<span className="text-amber-600">&amp;CO.</span>
        </button>
      </div>

      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg">
        <div className="p-6 sm:p-7">
          <h1 className="text-2xl font-bold text-stone-900">
            {mode === "signin" ? "Sign In to ThreadCraft" : "Create your Account"}
          </h1>

          {/* Mode Switch Tabs */}
          <div className="mt-5 grid grid-cols-2 gap-2 border-b border-stone-200">
            <button
              type="button"
              onClick={() => changeMode("signin")}
              className={`border-b-2 py-2.5 text-xs font-bold transition ${
                mode === "signin"
                  ? "border-amber-600 text-stone-900"
                  : "border-transparent text-stone-400 hover:text-stone-600"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => changeMode("signup")}
              className={`border-b-2 py-2.5 text-xs font-bold transition ${
                mode === "signup"
                  ? "border-amber-600 text-stone-900"
                  : "border-transparent text-stone-400 hover:text-stone-600"
              }`}
            >
              Register
            </button>
          </div>

          {/* Alerts */}
          {successMessage && (
            <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
              <span>✓</span> {successMessage}
            </div>
          )}

          {formErrors.submit && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-center gap-2">
              <span>⚠️</span> {formErrors.submit}
            </div>
          )}

          {/* CONTINUE WITH GOOGLE BUTTON */}
          <div className="mt-5">
            <button
              type="button"
              onClick={handleGoogleButtonClick}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50 hover:border-stone-400 cursor-pointer disabled:opacity-60"
            >
              {/* Google 4-Color SVG Icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-stone-400 font-semibold text-[10px] tracking-wider">
                Or with Email &amp; Password
              </span>
            </div>
          </div>

          {/* SIGN IN FORM */}
          {mode === "signin" ? (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="mb-1 block text-xs font-semibold text-stone-700"
                >
                  Email address
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com or user@thread.com"
                  value={signInData.email}
                  onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                  className={inputClass}
                />
                {formErrors.email && <p className={errorClass}>{formErrors.email}</p>}
                {signInData.email.trim() && (
                  <p className="mt-1.5 text-[11px] text-stone-500">
                    {isEmployeeEmail(signInData.email)
                      ? "👔 Staff account detected (@thread.com)."
                      : "👤 Customer account detected."}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="mb-1 block text-xs font-semibold text-stone-700"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter password"
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    className={`${inputClass} pr-16`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-xs font-semibold text-stone-500 hover:text-stone-800"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {formErrors.password && <p className={errorClass}>{formErrors.password}</p>}
              </div>

              <div className="flex items-center justify-between text-xs text-stone-600">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={signInData.rememberMe}
                    onChange={(e) => setSignInData({ ...signInData, rememberMe: e.target.checked })}
                    className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                  />
                  Remember session
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60 cursor-pointer shadow-md"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>

              {/* DEMO ACCOUNTS BOX */}
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 mt-4">
                <p className="text-xs font-bold text-stone-800">Quick Demo Accounts</p>
                <p className="text-[11px] text-stone-500">Click any account to prefill credentials:</p>
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => useDemoAccount("rahul")}
                    className="rounded-lg border border-stone-200 bg-white p-2 text-left hover:border-amber-500 hover:bg-amber-50/30 transition text-xs"
                  >
                    <p className="font-semibold text-stone-800">Rahul Mehta</p>
                    <p className="text-[10px] text-stone-400">rahul.mehta@example.com</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => useDemoAccount("priya")}
                    className="rounded-lg border border-stone-200 bg-white p-2 text-left hover:border-amber-500 hover:bg-amber-50/30 transition text-xs"
                  >
                    <p className="font-semibold text-stone-800">Priya Shah</p>
                    <p className="text-[10px] text-stone-400">priya.shah@example.com</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => useDemoAccount("customer")}
                    className="rounded-lg border border-stone-200 bg-white p-2 text-left hover:border-amber-500 hover:bg-amber-50/30 transition text-xs"
                  >
                    <p className="font-semibold text-stone-800">Demo Customer</p>
                    <p className="text-[10px] text-stone-400">customer@demo.com</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => useDemoAccount("employee")}
                    className="rounded-lg border border-stone-200 bg-white p-2 text-left hover:border-amber-500 hover:bg-amber-50/30 transition text-xs"
                  >
                    <p className="font-semibold text-stone-800">👔 Staff Demo</p>
                    <p className="text-[10px] text-stone-400">demo@thread.com</p>
                  </button>
                </div>
                <p className="mt-2 text-[10px] text-stone-400 border-t border-stone-200 pt-1.5">
                  Password: <code>Customer123</code> / <code>Employee123</code>
                </p>
              </div>
            </form>
          ) : (
            /* SIGN UP FORM */
            <form onSubmit={handleSignUpSubmit} className="mt-4 max-h-[58vh] space-y-3.5 overflow-y-auto pr-1">
              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-700">Full Name</label>
                <input
                  value={signUpData.name}
                  onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. John Doe"
                />
                {formErrors.name && <p className={errorClass}>{formErrors.name}</p>}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-700">Email Address</label>
                <input
                  type="email"
                  value={signUpData.email}
                  onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                  className={inputClass}
                  placeholder="you@example.com or name@thread.com"
                />
                {formErrors.email && <p className={errorClass}>{formErrors.email}</p>}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-700">Mobile Number</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={signUpData.mobile}
                  onChange={(e) => setSignUpData({ ...signUpData, mobile: e.target.value })}
                  className={inputClass}
                  placeholder="10-digit mobile number"
                />
                {formErrors.mobile && <p className={errorClass}>{formErrors.mobile}</p>}
              </div>

              {signupIsEmployee ? (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-stone-700">Role</label>
                    <select
                      value={signUpData.emp_role}
                      onChange={(e) => setSignUpData({ ...signUpData, emp_role: e.target.value })}
                      className={inputClass}
                    >
                      <option>Sales Associate</option>
                      <option>Branch Manager</option>
                      <option>Cashier</option>
                      <option>Inventory Specialist</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-stone-700">Branch</label>
                    <select
                      value={signUpData.branch_id}
                      onChange={(e) => setSignUpData({ ...signUpData, branch_id: Number(e.target.value) })}
                      className={inputClass}
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-stone-700">City</label>
                      <input
                        value={signUpData.city}
                        onChange={(e) => setSignUpData({ ...signUpData, city: e.target.value })}
                        className={inputClass}
                        placeholder="Ahmedabad"
                      />
                      {formErrors.city && <p className={errorClass}>{formErrors.city}</p>}
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-stone-700">State</label>
                      <input
                        value={signUpData.state}
                        onChange={(e) => setSignUpData({ ...signUpData, state: e.target.value })}
                        className={inputClass}
                        placeholder="Gujarat"
                      />
                      {formErrors.state && <p className={errorClass}>{formErrors.state}</p>}
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-stone-700">Pincode</label>
                      <input
                        maxLength={6}
                        value={signUpData.pincode}
                        onChange={(e) => setSignUpData({ ...signUpData, pincode: e.target.value })}
                        className={inputClass}
                        placeholder="380001"
                      />
                      {formErrors.pincode && <p className={errorClass}>{formErrors.pincode}</p>}
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-stone-700">Password</label>
                  <div className="relative">
                    <input
                      type={showSignUpPassword ? "text" : "password"}
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      className={`${inputClass} pr-16`}
                      placeholder="Min 6 chars"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="absolute right-3 top-3 text-xs font-semibold text-stone-500 hover:text-stone-800"
                    >
                      {showSignUpPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {formErrors.password && <p className={errorClass}>{formErrors.password}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-stone-700">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showSignUpConfirmPassword ? "text" : "password"}
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                      className={`${inputClass} pr-16`}
                      placeholder="Repeat password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpConfirmPassword(!showSignUpConfirmPassword)}
                      className="absolute right-3 top-3 text-xs font-semibold text-stone-500 hover:text-stone-800"
                    >
                      {showSignUpConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {formErrors.confirmPassword && <p className={errorClass}>{formErrors.confirmPassword}</p>}
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={signUpData.agreeTerms}
                  onChange={(e) => setSignUpData({ ...signUpData, agreeTerms: e.target.checked })}
                  className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                />
                <span>I agree to ThreadCraft Terms of Service.</span>
              </label>
              {formErrors.agreeTerms && <p className={errorClass}>{formErrors.agreeTerms}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-amber-600 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60 cursor-pointer shadow-md mt-2"
              >
                {isLoading ? "Creating account..." : "Complete Registration"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;

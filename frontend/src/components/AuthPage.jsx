import { useMemo, useState } from "react";

function AuthPage({ onNavigateToStore, currentUser, onLoginSuccess, onLogout }) {
  const [mode, setMode] = useState("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formErrors, setFormErrors] = useState({});
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
    city: "",
    state: "",
    pincode: "",
    emp_role: "Sales Associate",
    branch_id: 1,
    agreeTerms: false,
  });

  const demoUsers = {
    customer: { email: "customer@demo.com", password: "Customer123" },
    employee: { email: "demo@thread.com", password: "Employee123" },
  };

  const isEmployeeEmail = (email) =>
    email.trim().toLowerCase().endsWith("@thread.com");

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

  function handleSignInSubmit(e) {
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

    // Demo behavior: the email domain decides the account type.
    // Real authentication and employee authorization must be checked by the backend.
    const employee = isEmployeeEmail(email);
    const isDemoCustomer = email === demoUsers.customer.email && signInData.password === demoUsers.customer.password;
    const isDemoEmployee = email === demoUsers.employee.email && signInData.password === demoUsers.employee.password;
    const name = isDemoCustomer
      ? "Demo Customer"
      : isDemoEmployee
        ? "Demo Employee"
        : email.split("@")[0].replace(/[._-]/g, " ");

    const user = employee
      ? {
          role: "employee",
          emp_id: null,
          name,
          email,
          mobile: "",
          emp_role: "Employee",
          branch_id: 1,
          branch_name: "Surat Central",
        }
      : {
          role: "customer",
          cust_id: null,
          name,
          email,
          mobile_no: "",
          house_no: "",
          street: "",
          area: "",
          city: "",
          state: "",
          pincode: "",
        };

    setSuccessMessage(
      employee ? `Employee email detected. Welcome, ${name}!` : `Welcome, ${name}!`
    );
    setFormErrors({});
    window.setTimeout(() => {
      onLoginSuccess(user);
      onNavigateToStore();
    }, 700);
  }

  function handleSignUpSubmit(e) {
    e.preventDefault();
    const errors = {};
    const email = signUpData.email.trim().toLowerCase();
    const employee = isEmployeeEmail(email);

    if (!signUpData.name.trim()) errors.name = "Full name is required.";
    if (!email) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!signUpData.mobile.trim()) errors.mobile = "Mobile number is required.";
    else if (!/^\d{10}$/.test(signUpData.mobile.replace(/\D/g, ""))) {
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
      if (!signUpData.city.trim()) errors.city = "City is required.";
      if (!signUpData.state.trim()) errors.state = "State is required.";
      if (!/^\d{6}$/.test(signUpData.pincode.trim())) {
        errors.pincode = "Enter a valid 6-digit PIN code.";
      }
    }
    if (!signUpData.agreeTerms) errors.agreeTerms = "Please accept the policy to continue.";

    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    const branch = branches.find((item) => item.id === Number(signUpData.branch_id));
    const user = employee
      ? {
          role: "employee",
          emp_id: null,
          name: signUpData.name.trim(),
          email,
          mobile: signUpData.mobile.trim(),
          emp_role: signUpData.emp_role,
          branch_id: Number(signUpData.branch_id),
          branch_name: branch?.name || "Surat Central",
          emp_status: "Active",
        }
      : {
          role: "customer",
          cust_id: null,
          name: signUpData.name.trim(),
          email,
          mobile_no: signUpData.mobile.trim(),
          house_no: signUpData.house_no.trim(),
          street: signUpData.street.trim(),
          area: signUpData.area.trim(),
          city: signUpData.city.trim(),
          state: signUpData.state.trim(),
          pincode: signUpData.pincode.trim(),
        };

    setSuccessMessage(
      employee
        ? `Employee account created for ${user.name}.`
        : `Customer account created for ${user.name}.`
    );
    setFormErrors({});
    window.setTimeout(() => {
      onLoginSuccess(user);
      onNavigateToStore();
    }, 700);
  }

  const inputClass =
    "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-700 focus:ring-2 focus:ring-amber-100";
  const errorClass = "mt-1 text-xs text-red-600";

  if (currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-xl">
          <div className="text-4xl">{currentUser.role === "employee" ? "👔" : "👤"}</div>
          <h2 className="mt-3 text-2xl font-bold text-stone-900">You are signed in</h2>
          <p className="mt-2 font-semibold text-stone-800">{currentUser.name}</p>
          <p className="text-sm text-stone-500">{currentUser.email}</p>
          <p className="mt-3 inline-block rounded-full bg-stone-100 px-3 py-1 text-xs font-bold uppercase text-stone-700">
            {currentUser.role === "employee" ? "Employee" : "Customer"}
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button onClick={onNavigateToStore} className="rounded-full bg-stone-900 px-6 py-3 text-sm font-bold text-white hover:bg-gray-700">
              Continue to Store
            </button>
            <button onClick={onLogout} className="rounded-full border border-stone-300 px-6 py-3 text-sm font-bold text-stone-700 hover:bg-stone-100">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 flex flex-col items-center justify-center">
      <div className="mb-5 flex w-full max-w-md items-center justify-between">
        <button onClick={onNavigateToStore} className="text-sm text-gray-600 hover:text-gray-900">
          ← Back to Store
        </button>
        <button onClick={onNavigateToStore} className="text-xl font-bold tracking-tight text-gray-900">
          THREAD<span className="text-amber-600"> &amp; CO.</span>
        </button>
      </div>

      <div className="w-full max-w-md overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="p-5 sm:p-7">
          <h1 className="text-2xl font-semibold text-gray-900">Welcome to ThreadCraft</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create a new account or log in to your existing account.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2 border-b border-gray-200">
            <button
              type="button"
              onClick={() => changeMode("signup")}
              className={`border-b-2 py-3 text-sm font-medium ${mode === "signup" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500"}`}
            >
              Create New Account
            </button>
            <button
              type="button"
              onClick={() => changeMode("signin")}
              className={`border-b-2 py-3 text-sm font-medium ${mode === "signin" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500"}`}
            >
              Login Existing Account
            </button>
          </div>

          {successMessage && (
            <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-800">
              {successMessage}
            </div>
          )}

          {mode === "signin" ? (
            <form onSubmit={handleSignInSubmit} className="mt-5 space-y-4">
              <div>
                <label htmlFor="login-email" className="mb-1 block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com or name@thread.com"
                  value={signInData.email}
                  onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                  className={inputClass}
                />
                {formErrors.email && <p className={errorClass}>{formErrors.email}</p>}
                {signInData.email.trim() && (
                  <p className="mt-2 text-xs text-gray-500">
                    {isEmployeeEmail(signInData.email)
                      ? "Employee email detected (@thread.com)."
                      : "Customer account detected."}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="login-password" className="mb-1 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    className={`${inputClass} pr-16`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-xs font-bold text-stone-500">
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {formErrors.password && <p className={errorClass}>{formErrors.password}</p>}
              </div>

              <label className="flex items-center gap-2 text-xs text-stone-600">
                <input
                  type="checkbox"
                  checked={signInData.rememberMe}
                  onChange={(e) => setSignInData({ ...signInData, rememberMe: e.target.checked })}
                  className="h-4 w-4"
                />
                Remember this browser
              </label>

              <button type="submit" className="w-full rounded-md bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-gray-700">
                Login
              </button>

              <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                <p className="text-sm font-semibold text-gray-800">Try a demo account</p>
                <p className="mt-1 text-xs text-gray-500">Choose an account to fill in the login details.</p>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => useDemoAccount("customer")}
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Use Customer Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => useDemoAccount("employee")}
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Use Employee Demo
                  </button>
                </div>
                <div className="mt-3 space-y-1 text-xs text-gray-600">
                  <p><strong>Customer:</strong> customer@demo.com / Customer123</p>
                  <p><strong>Employee:</strong> demo@thread.com / Employee123</p>
                </div>
              </div>
              <p className="text-center text-xs text-gray-500">
                Employee access uses an email ending in <strong>@thread.com</strong>.
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignUpSubmit} className="mt-5 max-h-[60vh] space-y-4 overflow-y-auto pr-1">
              <div className={`rounded-md border p-3 text-sm ${signupIsEmployee ? "border-amber-200 bg-amber-50 text-amber-900" : "border-stone-200 bg-stone-50 text-stone-600"}`}>
                {signupIsEmployee
                  ? "Employee account setup: your @thread.com email selects the employee account type."
                  : "Customer account setup: use a regular email address. Use @thread.com for an employee account."}
              </div>

              <div>
                <label htmlFor="signup-name" className="mb-1 block text-sm font-medium text-gray-700">
                  Full name
                </label>
                <input id="signup-name" value={signUpData.name} onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })} className={inputClass} placeholder="Your full name" />
                {formErrors.name && <p className={errorClass}>{formErrors.name}</p>}
              </div>

              <div>
                <label htmlFor="signup-email" className="mb-1 block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input id="signup-email" type="email" autoComplete="email" value={signUpData.email} onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })} className={inputClass} placeholder="you@example.com or name@thread.com" />
                {formErrors.email && <p className={errorClass}>{formErrors.email}</p>}
              </div>

              <div>
                <label htmlFor="signup-mobile" className="mb-1 block text-sm font-medium text-gray-700">
                  Mobile number
                </label>
                <input id="signup-mobile" type="tel" maxLength={10} value={signUpData.mobile} onChange={(e) => setSignUpData({ ...signUpData, mobile: e.target.value })} className={inputClass} placeholder="10-digit mobile number" />
                {formErrors.mobile && <p className={errorClass}>{formErrors.mobile}</p>}
              </div>

              {signupIsEmployee ? (
                <>
                  <div>
                    <label htmlFor="signup-role" className="mb-1 block text-sm font-medium text-gray-700">Employee role</label>
                    <select id="signup-role" value={signUpData.emp_role} onChange={(e) => setSignUpData({ ...signUpData, emp_role: e.target.value })} className={inputClass}>
                      <option>Sales Associate</option>
                      <option>Branch Manager</option>
                      <option>Cashier</option>
                      <option>Inventory Specialist</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="signup-branch" className="mb-1 block text-sm font-medium text-gray-700">Branch</label>
                    <select id="signup-branch" value={signUpData.branch_id} onChange={(e) => setSignUpData({ ...signUpData, branch_id: Number(e.target.value) })} className={inputClass}>
                      {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="signup-house" className="mb-1 block text-sm font-medium text-gray-700">House number</label>
                      <input id="signup-house" value={signUpData.house_no} onChange={(e) => setSignUpData({ ...signUpData, house_no: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="signup-street" className="mb-1 block text-sm font-medium text-gray-700">Street</label>
                      <input id="signup-street" value={signUpData.street} onChange={(e) => setSignUpData({ ...signUpData, street: e.target.value })} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="signup-area" className="mb-1 block text-sm font-medium text-gray-700">Area</label>
                    <input id="signup-area" value={signUpData.area} onChange={(e) => setSignUpData({ ...signUpData, area: e.target.value })} className={inputClass} />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label htmlFor="signup-city" className="mb-1 block text-sm font-medium text-gray-700">City</label>
                      <input id="signup-city" value={signUpData.city} onChange={(e) => setSignUpData({ ...signUpData, city: e.target.value })} className={inputClass} />
                      {formErrors.city && <p className={errorClass}>{formErrors.city}</p>}
                    </div>
                    <div>
                      <label htmlFor="signup-state" className="mb-1 block text-sm font-medium text-gray-700">State</label>
                      <input id="signup-state" value={signUpData.state} onChange={(e) => setSignUpData({ ...signUpData, state: e.target.value })} className={inputClass} />
                      {formErrors.state && <p className={errorClass}>{formErrors.state}</p>}
                    </div>
                    <div>
                      <label htmlFor="signup-pincode" className="mb-1 block text-sm font-medium text-gray-700">PIN code</label>
                      <input id="signup-pincode" maxLength={6} value={signUpData.pincode} onChange={(e) => setSignUpData({ ...signUpData, pincode: e.target.value })} className={inputClass} />
                      {formErrors.pincode && <p className={errorClass}>{formErrors.pincode}</p>}
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="signup-password" className="mb-1 block text-sm font-medium text-gray-700">Password</label>
                  <input id="signup-password" type="password" autoComplete="new-password" value={signUpData.password} onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })} className={inputClass} placeholder="At least 6 characters" />
                  {formErrors.password && <p className={errorClass}>{formErrors.password}</p>}
                </div>
                <div>
                  <label htmlFor="signup-confirm" className="mb-1 block text-sm font-medium text-gray-700">Confirm password</label>
                  <input id="signup-confirm" type="password" autoComplete="new-password" value={signUpData.confirmPassword} onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })} className={inputClass} placeholder="Repeat password" />
                  {formErrors.confirmPassword && <p className={errorClass}>{formErrors.confirmPassword}</p>}
                </div>
              </div>

              <label className="flex items-start gap-2 text-xs text-stone-600">
                <input type="checkbox" checked={signUpData.agreeTerms} onChange={(e) => setSignUpData({ ...signUpData, agreeTerms: e.target.checked })} className="mt-0.5 h-4 w-4" />
                <span>{signupIsEmployee ? "I agree to the ThreadCraft staff policies." : "I agree to ThreadCraft's Terms of Service and Privacy Policy."}</span>
              </label>
              {formErrors.agreeTerms && <p className={errorClass}>{formErrors.agreeTerms}</p>}

              <button type="submit" className={`w-full rounded-md py-3 text-sm font-semibold text-white ${signupIsEmployee ? "bg-gray-900 hover:bg-gray-700" : "bg-stone-900 hover:bg-gray-700"}`}>
                Create {signupIsEmployee ? "Employee" : "Customer"} Account
              </button>
            </form>
          )}
        </div>
      </div>
      <p className="mt-5 max-w-xl text-center text-xs text-gray-500">
        Demo UI only. The server must verify passwords and confirm employee accounts before granting staff permissions.
      </p>
    </div>
  );
}

export default AuthPage;

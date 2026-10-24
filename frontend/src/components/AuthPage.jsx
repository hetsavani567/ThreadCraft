import { useState } from "react";

function AuthPage({ onNavigateToStore, currentUser, onLoginSuccess, onLogout }) {
  // Modes: "signin" | "signup"
  const [mode, setMode] = useState("signin");
  // Account Type for Signup: "customer" | "employee"
  const [accountType, setAccountType] = useState("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formErrors, setFormErrors] = useState({});

  // Sign In Form State
  const [signInData, setSignInData] = useState({
    identifier: "", // email or mobile
    password: "",
    rememberMe: true,
  });

  // Customer Sign Up State (customer table attributes)
  const [customerSignUp, setCustomerSignUp] = useState({
    name: "",
    email: "",
    mobile_no: "",
    password: "",
    confirmPassword: "",
    house_no: "",
    street: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    agreeTerms: false,
  });

  // Employee Sign Up State (employee table attributes from database schema)
  const [employeeSignUp, setEmployeeSignUp] = useState({
    emp_name: "",
    emp_email: "",
    mobile: "",
    emp_role: "Sales Associate",
    branch_id: 1,
    staff_code: "TC-STAFF-2026",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  // Sample data from sample_data.sql for quick testing
  const sampleCustomers = [
    {
      name: "Rahul Mehta",
      email: "rahul.mehta@example.com",
      mobile_no: "9876500001",
      house_no: "12",
      street: "Ring Road",
      area: "Adajan",
      city: "Surat",
      state: "Gujarat",
      pincode: "395009",
    },
    {
      name: "Priya Shah",
      email: "priya.shah@example.com",
      mobile_no: "9876500002",
      house_no: "45",
      street: "Station Road",
      area: "Vesu",
      city: "Surat",
      state: "Gujarat",
      pincode: "395007",
    },
  ];

  const sampleEmployees = [
    {
      emp_id: 1,
      emp_name: "Suresh Joshi",
      emp_email: "suresh.joshi@retail.example.com",
      mobile: "9800000001",
      emp_role: "Branch Manager",
      branch_id: 1,
      branch_name: "Surat Central",
    },
    {
      emp_id: 2,
      emp_name: "Anita Desai",
      emp_email: "anita.desai@retail.example.com",
      mobile: "9800000002",
      emp_role: "Cashier",
      branch_id: 1,
      branch_name: "Surat Central",
    },
    {
      emp_id: 4,
      emp_name: "Pooja Nair",
      emp_email: "pooja.nair@retail.example.com",
      mobile: "9800000004",
      emp_role: "Sales Associate",
      branch_id: 2,
      branch_name: "Ahmedabad West",
    },
  ];

  const branches = [
    { id: 1, name: "Surat Central (Ring Road, Surat)" },
    { id: 2, name: "Ahmedabad West (SG Highway, Ahmedabad)" },
    { id: 3, name: "Mumbai Andheri (Link Road, Mumbai)" },
  ];

  function handleFillCustomer(customer) {
    if (mode === "signin") {
      setSignInData({
        identifier: customer.email,
        password: "Password@123",
        rememberMe: true,
      });
    } else {
      setAccountType("customer");
      setCustomerSignUp({
        ...customer,
        password: "Password@123",
        confirmPassword: "Password@123",
        agreeTerms: true,
      });
    }
    setFormErrors({});
  }

  function handleFillEmployee(employee) {
    if (mode === "signin") {
      setSignInData({
        identifier: employee.emp_email,
        password: "Password@123",
        rememberMe: true,
      });
    } else {
      setAccountType("employee");
      setEmployeeSignUp({
        emp_name: employee.emp_name,
        emp_email: employee.emp_email,
        mobile: employee.mobile,
        emp_role: employee.emp_role,
        branch_id: employee.branch_id,
        staff_code: "TC-STAFF-2026",
        password: "Password@123",
        confirmPassword: "Password@123",
        agreeTerms: true,
      });
    }
    setFormErrors({});
  }

  function handleSignInSubmit(e) {
    e.preventDefault();
    const errors = {};

    if (!signInData.identifier.trim()) {
      errors.identifier = "Email or Mobile is required.";
    }
    if (!signInData.password) {
      errors.password = "Password is required.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const idLower = signInData.identifier.toLowerCase();

    // Check if employee demo credentials
    const matchingEmployee = sampleEmployees.find(
      (emp) =>
        emp.emp_email.toLowerCase() === idLower ||
        emp.mobile === signInData.identifier ||
        idLower.includes("retail.example.com")
    );

    if (matchingEmployee || idLower.includes("staff") || idLower.includes("emp")) {
      const empUser = {
        role: "employee",
        emp_id: matchingEmployee?.emp_id || Math.floor(Math.random() * 800) + 100,
        name: matchingEmployee?.emp_name || "Store Staff Member",
        email: matchingEmployee?.emp_email || signInData.identifier,
        mobile: matchingEmployee?.mobile || "9800000001",
        emp_role: matchingEmployee?.emp_role || "Branch Manager",
        branch_id: matchingEmployee?.branch_id || 1,
        branch_name: matchingEmployee?.branch_name || "Surat Central",
      };

      setSuccessMessage(`Welcome back, Staff ${empUser.name} (${empUser.emp_role})!`);
      setFormErrors({});

      setTimeout(() => {
        onLoginSuccess(empUser);
        onNavigateToStore();
      }, 1100);
      return;
    }

    // Default: Customer Login
    const customerUser = {
      role: "customer",
      cust_id: Math.floor(Math.random() * 900) + 100,
      name: signInData.identifier.includes("@")
        ? signInData.identifier.split("@")[0].replace(".", " ")
        : "Valued Customer",
      email: signInData.identifier.includes("@")
        ? signInData.identifier
        : `${signInData.identifier}@customer.example.com`,
      mobile_no: !signInData.identifier.includes("@") ? signInData.identifier : "9876500001",
      house_no: "12",
      street: "Ring Road",
      area: "Adajan",
      city: "Surat",
      state: "Gujarat",
      pincode: "395009",
    };

    setSuccessMessage(`Welcome back, ${customerUser.name}!`);
    setFormErrors({});

    setTimeout(() => {
      onLoginSuccess(customerUser);
      onNavigateToStore();
    }, 1100);
  }

  function handleCustomerSignUpSubmit(e) {
    e.preventDefault();
    const errors = {};

    if (!customerSignUp.name.trim()) errors.name = "Full Name is required.";
    if (!customerSignUp.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(customerSignUp.email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!customerSignUp.mobile_no.trim()) {
      errors.mobile_no = "Mobile Number is required.";
    } else if (!/^\d{10}$/.test(customerSignUp.mobile_no.replace(/\D/g, ""))) {
      errors.mobile_no = "Please enter a 10-digit mobile number.";
    }
    if (!customerSignUp.password) {
      errors.password = "Password is required.";
    } else if (customerSignUp.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }
    if (customerSignUp.password !== customerSignUp.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (!customerSignUp.city.trim()) errors.city = "City is required.";
    if (!customerSignUp.state.trim()) errors.state = "State is required.";
    if (!customerSignUp.pincode.trim()) {
      errors.pincode = "PIN Code is required.";
    } else if (!/^\d{6}$/.test(customerSignUp.pincode.trim())) {
      errors.pincode = "PIN Code must be exactly 6 digits.";
    }

    if (!customerSignUp.agreeTerms) {
      errors.agreeTerms = "You must agree to the Terms of Service.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const newCustomer = {
      role: "customer",
      cust_id: Math.floor(Math.random() * 900) + 100,
      name: customerSignUp.name.trim(),
      email: customerSignUp.email.trim(),
      mobile_no: customerSignUp.mobile_no.trim(),
      house_no: customerSignUp.house_no.trim() || "N/A",
      street: customerSignUp.street.trim() || "N/A",
      area: customerSignUp.area.trim() || "N/A",
      city: customerSignUp.city.trim(),
      state: customerSignUp.state.trim(),
      pincode: customerSignUp.pincode.trim(),
    };

    setSuccessMessage(`Customer Account created successfully for ${newCustomer.name}!`);
    setFormErrors({});

    setTimeout(() => {
      onLoginSuccess(newCustomer);
      onNavigateToStore();
    }, 1200);
  }

  function handleEmployeeSignUpSubmit(e) {
    e.preventDefault();
    const errors = {};

    if (!employeeSignUp.emp_name.trim()) errors.emp_name = "Employee Name is required.";
    if (!employeeSignUp.emp_email.trim()) {
      errors.emp_email = "Staff Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(employeeSignUp.emp_email)) {
      errors.emp_email = "Please enter a valid work email.";
    }
    if (!employeeSignUp.mobile.trim()) {
      errors.mobile = "Mobile Number is required.";
    } else if (!/^\d{10}$/.test(employeeSignUp.mobile.replace(/\D/g, ""))) {
      errors.mobile = "Please enter a 10-digit mobile number.";
    }
    if (!employeeSignUp.staff_code.trim()) {
      errors.staff_code = "Staff Security Code is required.";
    }
    if (!employeeSignUp.password) {
      errors.password = "Password is required.";
    } else if (employeeSignUp.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }
    if (employeeSignUp.password !== employeeSignUp.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }
    if (!employeeSignUp.agreeTerms) {
      errors.agreeTerms = "You must agree to the Staff Confidentiality Policy.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const branchObj = branches.find((b) => b.id === Number(employeeSignUp.branch_id));
    const newEmployee = {
      role: "employee",
      emp_id: Math.floor(Math.random() * 800) + 100,
      name: employeeSignUp.emp_name.trim(),
      email: employeeSignUp.emp_email.trim(),
      mobile: employeeSignUp.mobile.trim(),
      emp_role: employeeSignUp.emp_role,
      branch_id: Number(employeeSignUp.branch_id),
      branch_name: branchObj ? branchObj.name.split(" ")[0] + " " + branchObj.name.split(" ")[1] : "Surat Central",
      emp_status: "Active",
    };

    setSuccessMessage(`Employee account created for ${newEmployee.name} (${newEmployee.emp_role})! Accessing Staff Features...`);
    setFormErrors({});

    setTimeout(() => {
      onLoginSuccess(newEmployee);
      onNavigateToStore();
    }, 1300);
  }

  return (
    <div className="min-h-screen bg-stone-100 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      {/* Top Bar with brand and back button */}
      <div className="mx-auto w-full max-w-4xl mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onNavigateToStore}
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-700 hover:text-amber-800 transition"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Store
        </button>

        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onNavigateToStore();
          }}
          className="text-2xl font-black tracking-tight text-stone-900"
        >
          THREAD<span className="text-amber-600"> & CO.</span>
        </a>

        <div className="text-xs text-stone-500 hidden sm:block">
          Customer & Staff Access
        </div>
      </div>

      {/* Main Container Card */}
      <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-xl border border-stone-200">
        <div className="p-6 sm:p-10 flex flex-col justify-center">
          {/* Active Logged-in Banner */}
          {currentUser ? (
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6 text-center">
              <div
                className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold ${
                  currentUser.role === "employee"
                    ? "bg-amber-600 text-white"
                    : "bg-stone-900 text-white"
                }`}
              >
                {currentUser.role === "employee" ? "👔" : "👤"}
              </div>

              <h3 className="mt-3 text-xl font-bold text-stone-900">
                You are currently signed in
              </h3>

              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="text-sm text-stone-700 font-bold">{currentUser.name}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                    currentUser.role === "employee"
                      ? "bg-amber-500 text-stone-950"
                      : "bg-stone-200 text-stone-800"
                  }`}
                >
                  {currentUser.role === "employee" ? `Staff (${currentUser.emp_role})` : "Customer"}
                </span>
              </div>

              <p className="text-xs text-stone-500 mt-1">{currentUser.email}</p>

              {currentUser.role === "employee" ? (
                <div className="mt-4 rounded-xl bg-amber-50 p-3.5 border border-amber-200 text-left text-xs text-amber-900 space-y-1">
                  <p className="font-bold text-amber-950 mb-1">Staff Member Privileges Active:</p>
                  <p><span className="font-semibold">Role:</span> {currentUser.emp_role}</p>
                  <p><span className="font-semibold">Assigned Branch:</span> {currentUser.branch_name}</p>
                  <p><span className="font-semibold">Staff Features:</span> Inventory Adjustment, Order Statuses, 20% Staff Discount</p>
                </div>
              ) : (
                <div className="mt-4 rounded-xl bg-white p-3.5 border border-stone-200 text-left text-xs text-stone-600 space-y-1">
                  <p className="font-semibold text-stone-800 mb-1">Customer Delivery Address:</p>
                  <p>
                    {[
                      currentUser.house_no,
                      currentUser.street,
                      currentUser.area,
                      currentUser.city,
                      currentUser.state,
                      currentUser.pincode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={onNavigateToStore}
                  className="rounded-full bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition"
                >
                  Continue to Store
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-100 transition"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Tab Selector: Sign In vs Sign Up */}
              <div className="flex border-b border-stone-200 mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setFormErrors({});
                  }}
                  className={`pb-3 text-base font-bold transition mr-8 ${
                    mode === "signin"
                      ? "text-stone-900 border-b-2 border-stone-900"
                      : "text-stone-400 hover:text-stone-700"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setFormErrors({});
                  }}
                  className={`pb-3 text-base font-bold transition ${
                    mode === "signup"
                      ? "text-stone-900 border-b-2 border-stone-900"
                      : "text-stone-400 hover:text-stone-700"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Demo Pre-fill helper banner with Customer and Employee options */}
              <div className="mb-5 rounded-xl bg-stone-50 border border-stone-200 p-3 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-stone-700">Quick Test with Demo Users:</span>
                  <span className="text-[10px] text-stone-400">Click to fill</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-stone-400 text-[11px] self-center">Customer:</span>
                  <button
                    type="button"
                    onClick={() => handleFillCustomer(sampleCustomers[0])}
                    className="rounded bg-white px-2 py-0.5 font-semibold text-amber-800 border border-stone-200 hover:border-amber-700"
                  >
                    Rahul Mehta
                  </button>
                  <span className="text-stone-300 self-center">|</span>
                  <span className="text-stone-400 text-[11px] self-center">Staff (Employee):</span>
                  <button
                    type="button"
                    onClick={() => handleFillEmployee(sampleEmployees[0])}
                    className="rounded bg-amber-100/80 px-2 py-0.5 font-bold text-amber-950 border border-amber-300 hover:bg-amber-200"
                  >
                    👔 Suresh (Manager)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillEmployee(sampleEmployees[1])}
                    className="rounded bg-amber-100/80 px-2 py-0.5 font-bold text-amber-950 border border-amber-300 hover:bg-amber-200"
                  >
                    Anita (Cashier)
                  </button>
                </div>
              </div>

              {/* Success Notification */}
              {successMessage && (
                <div className="mb-5 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-sm font-semibold text-emerald-800 flex items-center gap-2 animate-fadeIn">
                  <svg className="h-5 w-5 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{successMessage}</span>
                </div>
              )}

              {/* ===================== SIGN IN FORM ===================== */}
              {mode === "signin" ? (
                <form onSubmit={handleSignInSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="signin-identifier"
                      className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1"
                    >
                      Email or Mobile Number (Customer or Staff)
                    </label>
                    <input
                      id="signin-identifier"
                      type="text"
                      placeholder="e.g. suresh.joshi@retail.example.com or rahul@example.com"
                      value={signInData.identifier}
                      onChange={(e) =>
                        setSignInData({ ...signInData, identifier: e.target.value })
                      }
                      className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-amber-100 ${
                        formErrors.identifier
                          ? "border-red-400 focus:border-red-500"
                          : "border-stone-300 focus:border-amber-700"
                      }`}
                    />
                    {formErrors.identifier && (
                      <p className="mt-1 text-xs text-red-600 font-medium">
                        {formErrors.identifier}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="signin-password"
                        className="block text-xs font-bold uppercase tracking-wider text-stone-700"
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          alert("Demo Mode: Any password works for testing.")
                        }
                        className="text-xs font-semibold text-amber-700 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={signInData.password}
                        onChange={(e) =>
                          setSignInData({ ...signInData, password: e.target.value })
                        }
                        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm pr-10 outline-none transition focus:ring-2 focus:ring-amber-100 ${
                          formErrors.password
                            ? "border-red-400 focus:border-red-500"
                            : "border-stone-300 focus:border-amber-700"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-xs font-semibold text-stone-500 hover:text-stone-800"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    {formErrors.password && (
                      <p className="mt-1 text-xs text-red-600 font-medium">
                        {formErrors.password}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={signInData.rememberMe}
                        onChange={(e) =>
                          setSignInData({
                            ...signInData,
                            rememberMe: e.target.checked,
                          })
                        }
                        className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-amber-500"
                      />
                      <span>Remember this browser</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-stone-900 py-3 text-sm font-bold text-white shadow-md hover:bg-amber-700 transition active:scale-[0.99]"
                  >
                    Sign In (Customer or Staff)
                  </button>

                  <p className="text-center text-xs text-stone-500 pt-2">
                    Need an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("signup")}
                      className="font-bold text-amber-700 hover:underline"
                    >
                      Create account
                    </button>
                  </p>
                </form>
              ) : (
                /* ===================== SIGN UP SECTION ===================== */
                <div>
                  {/* Account Type Selector: Customer vs Employee */}
                  <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-stone-100 p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAccountType("customer");
                        setFormErrors({});
                      }}
                      className={`rounded-xl py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        accountType === "customer"
                          ? "bg-white text-stone-950 shadow-xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      <span>👤</span>
                      <span>Customer Account</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAccountType("employee");
                        setFormErrors({});
                      }}
                      className={`rounded-xl py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        accountType === "employee"
                          ? "bg-amber-600 text-white shadow-xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      <span>👔</span>
                      <span>Employee / Staff Role</span>
                    </button>
                  </div>

                  {accountType === "employee" ? (
                    /* ===================== EMPLOYEE SIGN UP FORM ===================== */
                    <form
                      onSubmit={handleEmployeeSignUpSubmit}
                      className="space-y-3.5 max-h-[58vh] overflow-y-auto pr-1"
                    >
                      <div className="rounded-xl bg-amber-50/80 border border-amber-200 p-2.5 text-xs text-amber-900">
                        <span className="font-bold">Staff Access:</span> Unlocks inventory stock adjustments, branch orders overview, and 20% staff discounts.
                      </div>

                      <div>
                        <label
                          htmlFor="emp-name"
                          className="block text-xs font-bold text-stone-700 mb-1"
                        >
                          Employee Full Name (<code className="font-mono text-amber-800">emp_name</code>) *
                        </label>
                        <input
                          id="emp-name"
                          type="text"
                          placeholder="e.g. Vikram Rao"
                          value={employeeSignUp.emp_name}
                          onChange={(e) =>
                            setEmployeeSignUp({ ...employeeSignUp, emp_name: e.target.value })
                          }
                          className={`w-full rounded-xl border bg-white px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-100 ${
                            formErrors.emp_name
                              ? "border-red-400 focus:border-red-500"
                              : "border-stone-300 focus:border-amber-700"
                          }`}
                        />
                        {formErrors.emp_name && (
                          <p className="mt-1 text-xs text-red-600 font-medium">
                            {formErrors.emp_name}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label
                            htmlFor="emp-email"
                            className="block text-xs font-bold text-stone-700 mb-1"
                          >
                            Staff Email (<code className="font-mono text-amber-800">emp_email</code>) *
                          </label>
                          <input
                            id="emp-email"
                            type="email"
                            placeholder="vikram.rao@retail.example.com"
                            value={employeeSignUp.emp_email}
                            onChange={(e) =>
                              setEmployeeSignUp({
                                ...employeeSignUp,
                                emp_email: e.target.value,
                              })
                            }
                            className={`w-full rounded-xl border bg-white px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-100 ${
                              formErrors.emp_email
                                ? "border-red-400 focus:border-red-500"
                                : "border-stone-300 focus:border-amber-700"
                            }`}
                          />
                          {formErrors.emp_email && (
                            <p className="mt-1 text-xs text-red-600 font-medium">
                              {formErrors.emp_email}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="emp-mobile"
                            className="block text-xs font-bold text-stone-700 mb-1"
                          >
                            Staff Mobile (<code className="font-mono text-amber-800">mobile</code>) *
                          </label>
                          <input
                            id="emp-mobile"
                            type="tel"
                            maxLength={10}
                            placeholder="9800000003"
                            value={employeeSignUp.mobile}
                            onChange={(e) =>
                              setEmployeeSignUp({
                                ...employeeSignUp,
                                mobile: e.target.value,
                              })
                            }
                            className={`w-full rounded-xl border bg-white px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-100 ${
                              formErrors.mobile
                                ? "border-red-400 focus:border-red-500"
                                : "border-stone-300 focus:border-amber-700"
                            }`}
                          />
                          {formErrors.mobile && (
                            <p className="mt-1 text-xs text-red-600 font-medium">
                              {formErrors.mobile}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label
                            htmlFor="emp-role"
                            className="block text-xs font-bold text-stone-700 mb-1"
                          >
                            Staff Role (<code className="font-mono text-amber-800">emp_role</code>)
                          </label>
                          <select
                            id="emp-role"
                            value={employeeSignUp.emp_role}
                            onChange={(e) =>
                              setEmployeeSignUp({
                                ...employeeSignUp,
                                emp_role: e.target.value,
                              })
                            }
                            className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-sm outline-none focus:border-amber-700"
                          >
                            <option value="Branch Manager">Branch Manager</option>
                            <option value="Cashier">Cashier</option>
                            <option value="Sales Associate">Sales Associate</option>
                            <option value="Inventory Specialist">Inventory Specialist</option>
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="emp-branch"
                            className="block text-xs font-bold text-stone-700 mb-1"
                          >
                            Branch (<code className="font-mono text-amber-800">branch_id</code>)
                          </label>
                          <select
                            id="emp-branch"
                            value={employeeSignUp.branch_id}
                            onChange={(e) =>
                              setEmployeeSignUp({
                                ...employeeSignUp,
                                branch_id: Number(e.target.value),
                              })
                            }
                            className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-sm outline-none focus:border-amber-700"
                          >
                            {branches.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="emp-code"
                          className="block text-xs font-bold text-stone-700 mb-1"
                        >
                          Staff Security Code *
                        </label>
                        <input
                          id="emp-code"
                          type="text"
                          placeholder="TC-STAFF-2026"
                          value={employeeSignUp.staff_code}
                          onChange={(e) =>
                            setEmployeeSignUp({
                              ...employeeSignUp,
                              staff_code: e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-sm outline-none focus:border-amber-700 font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label
                            htmlFor="emp-password"
                            className="block text-xs font-bold text-stone-700 mb-1"
                          >
                            Password *
                          </label>
                          <input
                            id="emp-password"
                            type="password"
                            placeholder="••••••••"
                            value={employeeSignUp.password}
                            onChange={(e) =>
                              setEmployeeSignUp({
                                ...employeeSignUp,
                                password: e.target.value,
                              })
                            }
                            className={`w-full rounded-xl border bg-white px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-100 ${
                              formErrors.password
                                ? "border-red-400 focus:border-red-500"
                                : "border-stone-300 focus:border-amber-700"
                            }`}
                          />
                          {formErrors.password && (
                            <p className="mt-1 text-xs text-red-600 font-medium">
                              {formErrors.password}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="emp-confirm"
                            className="block text-xs font-bold text-stone-700 mb-1"
                          >
                            Confirm Password *
                          </label>
                          <input
                            id="emp-confirm"
                            type="password"
                            placeholder="••••••••"
                            value={employeeSignUp.confirmPassword}
                            onChange={(e) =>
                              setEmployeeSignUp({
                                ...employeeSignUp,
                                confirmPassword: e.target.value,
                              })
                            }
                            className={`w-full rounded-xl border bg-white px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-100 ${
                              formErrors.confirmPassword
                                ? "border-red-400 focus:border-red-500"
                                : "border-stone-300 focus:border-amber-700"
                            }`}
                          />
                          {formErrors.confirmPassword && (
                            <p className="mt-1 text-xs text-red-600 font-medium">
                              {formErrors.confirmPassword}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="flex items-start gap-2 text-xs text-stone-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={employeeSignUp.agreeTerms}
                            onChange={(e) =>
                              setEmployeeSignUp({
                                ...employeeSignUp,
                                agreeTerms: e.target.checked,
                              })
                            }
                            className="mt-0.5 h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-amber-500"
                          />
                          <span>
                            I agree to ThreadCraft Staff Confidentiality and Inventory Management Policies.
                          </span>
                        </label>
                        {formErrors.agreeTerms && (
                          <p className="mt-1 text-xs text-red-600 font-medium">
                            {formErrors.agreeTerms}
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="w-full rounded-xl bg-amber-600 py-3 text-sm font-bold text-white shadow-md hover:bg-amber-700 transition active:scale-[0.99]"
                      >
                        Register as Employee / Staff
                      </button>

                      <p className="text-center text-xs text-stone-500 pt-1">
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setMode("signin")}
                          className="font-bold text-amber-700 hover:underline"
                        >
                          Sign in
                        </button>
                      </p>
                    </form>
                  ) : (
                    /* ===================== CUSTOMER SIGN UP FORM ===================== */
                    <form
                      onSubmit={handleCustomerSignUpSubmit}
                      className="space-y-4 max-h-[58vh] overflow-y-auto pr-1"
                    >
                      <div className="border-b border-stone-200 pb-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-amber-700 mb-3">
                          1. Personal Details (customer table)
                        </h4>

                        <div className="space-y-3">
                          <div>
                            <label
                              htmlFor="signup-name"
                              className="block text-xs font-bold text-stone-700 mb-1"
                            >
                              Full Name (<code className="font-mono text-amber-800">name</code>) *
                            </label>
                            <input
                              id="signup-name"
                              type="text"
                              placeholder="e.g. Rahul Mehta"
                              value={customerSignUp.name}
                              onChange={(e) =>
                                setCustomerSignUp({ ...customerSignUp, name: e.target.value })
                              }
                              className={`w-full rounded-xl border bg-white px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-100 ${
                                formErrors.name
                                  ? "border-red-400 focus:border-red-500"
                                  : "border-stone-300 focus:border-amber-700"
                              }`}
                            />
                            {formErrors.name && (
                              <p className="mt-1 text-xs text-red-600 font-medium">
                                {formErrors.name}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label
                                htmlFor="signup-email"
                                className="block text-xs font-bold text-stone-700 mb-1"
                              >
                                Email (<code className="font-mono text-amber-800">email</code>) *
                              </label>
                              <input
                                id="signup-email"
                                type="email"
                                placeholder="rahul@example.com"
                                value={customerSignUp.email}
                                onChange={(e) =>
                                  setCustomerSignUp({ ...customerSignUp, email: e.target.value })
                                }
                                className={`w-full rounded-xl border bg-white px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-100 ${
                                  formErrors.email
                                    ? "border-red-400 focus:border-red-500"
                                    : "border-stone-300 focus:border-amber-700"
                                }`}
                              />
                              {formErrors.email && (
                                <p className="mt-1 text-xs text-red-600 font-medium">
                                  {formErrors.email}
                                </p>
                              )}
                            </div>

                            <div>
                              <label
                                htmlFor="signup-mobile"
                                className="block text-xs font-bold text-stone-700 mb-1"
                              >
                                Mobile (<code className="font-mono text-amber-800">mobile_no</code>) *
                              </label>
                              <input
                                id="signup-mobile"
                                type="tel"
                                maxLength={10}
                                placeholder="9876500001"
                                value={customerSignUp.mobile_no}
                                onChange={(e) =>
                                  setCustomerSignUp({
                                    ...customerSignUp,
                                    mobile_no: e.target.value,
                                  })
                                }
                                className={`w-full rounded-xl border bg-white px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-100 ${
                                  formErrors.mobile_no
                                    ? "border-red-400 focus:border-red-500"
                                    : "border-stone-300 focus:border-amber-700"
                                }`}
                              />
                              {formErrors.mobile_no && (
                                <p className="mt-1 text-xs text-red-600 font-medium">
                                  {formErrors.mobile_no}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label
                                htmlFor="signup-password"
                                className="block text-xs font-bold text-stone-700 mb-1"
                              >
                                Password *
                              </label>
                              <input
                                id="signup-password"
                                type="password"
                                placeholder="••••••••"
                                value={customerSignUp.password}
                                onChange={(e) =>
                                  setCustomerSignUp({
                                    ...customerSignUp,
                                    password: e.target.value,
                                  })
                                }
                                className={`w-full rounded-xl border bg-white px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-100 ${
                                  formErrors.password
                                    ? "border-red-400 focus:border-red-500"
                                    : "border-stone-300 focus:border-amber-700"
                                }`}
                              />
                              {formErrors.password && (
                                <p className="mt-1 text-xs text-red-600 font-medium">
                                  {formErrors.password}
                                </p>
                              )}
                            </div>

                            <div>
                              <label
                                htmlFor="signup-confirmpassword"
                                className="block text-xs font-bold text-stone-700 mb-1"
                              >
                                Confirm Password *
                              </label>
                              <input
                                id="signup-confirmpassword"
                                type="password"
                                placeholder="••••••••"
                                value={customerSignUp.confirmPassword}
                                onChange={(e) =>
                                  setCustomerSignUp({
                                    ...customerSignUp,
                                    confirmPassword: e.target.value,
                                  })
                                }
                                className={`w-full rounded-xl border bg-white px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-100 ${
                                  formErrors.confirmPassword
                                    ? "border-red-400 focus:border-red-500"
                                    : "border-stone-300 focus:border-amber-700"
                                }`}
                              />
                              {formErrors.confirmPassword && (
                                <p className="mt-1 text-xs text-red-600 font-medium">
                                  {formErrors.confirmPassword}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Address Attributes from Customer Table */}
                      <div className="border-b border-stone-200 pb-3 pt-1">
                        <h4 className="text-xs font-black uppercase tracking-wider text-amber-700 mb-3">
                          2. Delivery Address (customer table flattened address)
                        </h4>

                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label
                                htmlFor="signup-house"
                                className="block text-xs font-semibold text-stone-700 mb-1"
                              >
                                House (<code className="font-mono text-amber-800">house_no</code>)
                              </label>
                              <input
                                id="signup-house"
                                type="text"
                                placeholder="12"
                                value={customerSignUp.house_no}
                                onChange={(e) =>
                                  setCustomerSignUp({
                                    ...customerSignUp,
                                    house_no: e.target.value,
                                  })
                                }
                                className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-sm outline-none focus:border-amber-700"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label
                                htmlFor="signup-street"
                                className="block text-xs font-semibold text-stone-700 mb-1"
                              >
                                Street (<code className="font-mono text-amber-800">street</code>)
                              </label>
                              <input
                                id="signup-street"
                                type="text"
                                placeholder="Ring Road"
                                value={customerSignUp.street}
                                onChange={(e) =>
                                  setCustomerSignUp({
                                    ...customerSignUp,
                                    street: e.target.value,
                                  })
                                }
                                className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-sm outline-none focus:border-amber-700"
                              />
                            </div>
                          </div>

                          <div>
                            <label
                              htmlFor="signup-area"
                              className="block text-xs font-semibold text-stone-700 mb-1"
                            >
                              Area (<code className="font-mono text-amber-800">area</code>)
                            </label>
                            <input
                              id="signup-area"
                              type="text"
                              placeholder="Adajan"
                              value={customerSignUp.area}
                              onChange={(e) =>
                                setCustomerSignUp({
                                  ...customerSignUp,
                                  area: e.target.value,
                                })
                              }
                              className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-sm outline-none focus:border-amber-700"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label
                                htmlFor="signup-city"
                                className="block text-xs font-semibold text-stone-700 mb-1"
                              >
                                City (<code className="font-mono text-amber-800">city</code>) *
                              </label>
                              <input
                                id="signup-city"
                                type="text"
                                placeholder="Surat"
                                value={customerSignUp.city}
                                onChange={(e) =>
                                  setCustomerSignUp({
                                    ...customerSignUp,
                                    city: e.target.value,
                                  })
                                }
                                className={`w-full rounded-xl border bg-white px-3.5 py-2 text-sm outline-none ${
                                  formErrors.city
                                    ? "border-red-400 focus:border-red-500"
                                    : "border-stone-300 focus:border-amber-700"
                                }`}
                              />
                              {formErrors.city && (
                                <p className="mt-1 text-xs text-red-600 font-medium">
                                  {formErrors.city}
                                </p>
                              )}
                            </div>

                            <div>
                              <label
                                htmlFor="signup-state"
                                className="block text-xs font-semibold text-stone-700 mb-1"
                              >
                                State (<code className="font-mono text-amber-800">state</code>) *
                              </label>
                              <input
                                id="signup-state"
                                type="text"
                                placeholder="Gujarat"
                                value={customerSignUp.state}
                                onChange={(e) =>
                                  setCustomerSignUp({
                                    ...customerSignUp,
                                    state: e.target.value,
                                  })
                                }
                                className={`w-full rounded-xl border bg-white px-3.5 py-2 text-sm outline-none ${
                                  formErrors.state
                                    ? "border-red-400 focus:border-red-500"
                                    : "border-stone-300 focus:border-amber-700"
                                }`}
                              />
                              {formErrors.state && (
                                <p className="mt-1 text-xs text-red-600 font-medium">
                                  {formErrors.state}
                                </p>
                              )}
                            </div>

                            <div>
                              <label
                                htmlFor="signup-pincode"
                                className="block text-xs font-semibold text-stone-700 mb-1"
                              >
                                PIN (<code className="font-mono text-amber-800">pincode</code>) *
                              </label>
                              <input
                                id="signup-pincode"
                                type="text"
                                maxLength={6}
                                placeholder="395009"
                                value={customerSignUp.pincode}
                                onChange={(e) =>
                                  setCustomerSignUp({
                                    ...customerSignUp,
                                    pincode: e.target.value,
                                  })
                                }
                                className={`w-full rounded-xl border bg-white px-3.5 py-2 text-sm outline-none ${
                                  formErrors.pincode
                                    ? "border-red-400 focus:border-red-500"
                                    : "border-stone-300 focus:border-amber-700"
                                }`}
                              />
                              {formErrors.pincode && (
                                <p className="mt-1 text-xs text-red-600 font-medium">
                                  {formErrors.pincode}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="flex items-start gap-2 text-xs text-stone-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={customerSignUp.agreeTerms}
                            onChange={(e) =>
                              setCustomerSignUp({
                                ...customerSignUp,
                                agreeTerms: e.target.checked,
                              })
                            }
                            className="mt-0.5 h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-amber-500"
                          />
                          <span>
                            I agree to ThreadCraft's Terms of Service and Privacy Policy.
                          </span>
                        </label>
                        {formErrors.agreeTerms && (
                          <p className="mt-1 text-xs text-red-600 font-medium">
                            {formErrors.agreeTerms}
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="w-full rounded-xl bg-stone-900 py-3 text-sm font-bold text-white shadow-md hover:bg-amber-700 transition active:scale-[0.99]"
                      >
                        Register Customer Account
                      </button>

                      <p className="text-center text-xs text-stone-500 pt-1">
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setMode("signin")}
                          className="font-bold text-amber-700 hover:underline"
                        >
                          Sign in
                        </button>
                      </p>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;

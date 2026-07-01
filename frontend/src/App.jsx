import axios from "axios";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Trash2,
  LogOut,
  Plus,
  LayoutList,
  Settings,
  User as UserIcon,
  Lock,
  X,
} from "lucide-react";

// Setup global axios defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:8000/practice";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);

  // Auth state
  const [user, setUser] = useState({
    username: "",
    password: "",
    email: "",
    first_name: "",
    last_name: "",
  });
  const [authError, setAuthError] = useState("");

  // App state
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [filter, setFilter] = useState("All");

  // Settings/Profile State
  const [showSettings, setShowSettings] = useState(false);
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
  });
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [settingsMessage, setSettingsMessage] = useState({
    type: "",
    text: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const response = await axios.get("/check-auth/");
      setIsLoggedIn(response.data.message);
      if (response.data.message) {
        fetchTasks();
        fetchProfile();
      }
    } catch (error) {
      console.error("Auth check failed");
    }
  }

  // --- Auth Handlers ---
  async function handleAuth(e) {
    e.preventDefault();
    setAuthError("");
    try {
      if (isLoginView) {
        const response = await axios.post("/", {
          username: user.username,
          password: user.password,
        });
        if (response.data.message === "Login succesful") {
          setIsLoggedIn(true);
          fetchTasks();
          fetchProfile();
        } else {
          setAuthError(response.data.message);
        }
      } else {
        const response = await axios.post("/api/register/", user);
        if (response.data.message === "Registration successful") {
          setIsLoggedIn(true);
          fetchTasks();
          fetchProfile();
        }
      }
    } catch (error) {
      setAuthError(error.response?.data?.message || "Authentication failed");
    }
  }

  async function handleLogout() {
    await axios.post("/logout/", {});
    setIsLoggedIn(false);
    setTasks([]);
    setShowSettings(false);
  }

  // --- Profile & Password Handlers ---
  async function fetchProfile() {
    try {
      const response = await axios.get("/api/profile/");
      setProfile(response.data);
    } catch (error) {
      console.error("Failed to load profile");
    }
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();
    try {
      const response = await axios.put("/api/profile/", profile);
      setSettingsMessage({ type: "success", text: response.data.message });
    } catch (error) {
      setSettingsMessage({ type: "error", text: "Failed to update profile" });
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      return setSettingsMessage({
        type: "error",
        text: "New passwords do not match",
      });
    }
    try {
      const response = await axios.put("/api/change-password/", {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      });
      setSettingsMessage({ type: "success", text: response.data.message });
      setPasswordData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      setSettingsMessage({
        type: "error",
        text: error.response?.data?.message || "Password change failed",
      });
    }
  }

  // --- Task Handlers ---
  async function fetchTasks() {
    const response = await axios.get("/api/tasks/");
    setTasks(response.data);
  }

  async function handleCreateTask(e) {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await axios.post("/api/tasks/", { title: newTaskTitle });
    setNewTaskTitle("");
    fetchTasks();
  }

  async function handleDeleteTask(taskId) {
    await axios.delete(`/api/tasks/${taskId}/`);
    setTasks(tasks.filter((t) => t.id !== taskId));
  }

  async function handleToggleComplete(task) {
    const updatedStatus = !task.is_completed;
    setTasks(
      tasks.map((t) =>
        t.id === task.id ? { ...t, is_completed: updatedStatus } : t,
      ),
    );
    await axios.put(`/api/tasks/${task.id}/`, { is_completed: updatedStatus });
  }

  // --- Render Helpers ---
  const filteredTasks = tasks.filter((task) => {
    if (filter === "Active") return !task.is_completed;
    if (filter === "Completed") return task.is_completed;
    return true;
  });

  const stats = {
    active: tasks.filter((t) => !t.is_completed).length,
  };

  // --- UNAUTHENTICATED VIEW ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="flex justify-center mb-6 text-indigo-600">
            <LayoutList size={48} />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            {isLoginView ? "Welcome Back" : "Create an Account"}
          </h1>

          {authError && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLoginView && (
              <>
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="w-1/2 px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={user.first_name}
                    onChange={(e) =>
                      setUser({ ...user, first_name: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="w-1/2 px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={user.last_name}
                    onChange={(e) =>
                      setUser({ ...user, last_name: e.target.value })
                    }
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  required
                />
              </>
            )}
            <input
              type="text"
              placeholder="Username"
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              required
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {isLoginView ? "Sign In" : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-6 text-sm">
            {isLoginView
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              onClick={() => {
                setIsLoginView(!isLoginView);
                setAuthError("");
              }}
              className="text-indigo-600 font-semibold hover:underline"
            >
              {isLoginView ? "Sign Up" : "Log In"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // --- SETTINGS VIEW ---
  if (showSettings) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-800 pb-12">
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <LayoutList /> TaskMaster
          </div>
          <button
            onClick={() => {
              setShowSettings(false);
              setSettingsMessage({ type: "", text: "" });
            }}
            className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium"
          >
            <X size={18} /> Back to Tasks
          </button>
        </header>

        <main className="max-w-2xl mx-auto mt-10 px-4">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Settings className="text-indigo-600" /> Settings
          </h2>

          {settingsMessage.text && (
            <div
              className={`p-4 rounded-lg mb-6 ${settingsMessage.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
            >
              {settingsMessage.text}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b pb-2">
              <UserIcon size={20} /> Profile Details
            </h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={profile.first_name}
                    onChange={(e) =>
                      setProfile({ ...profile, first_name: e.target.value })
                    }
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={profile.last_name}
                    onChange={(e) =>
                      setProfile({ ...profile, last_name: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                />
              </div>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Update Profile
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b pb-2">
              <Lock size={20} /> Change Password
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={passwordData.old_password}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      old_password: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={passwordData.new_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        new_password: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={passwordData.confirm_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirm_password: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Update Password
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // --- DASHBOARD VIEW ---
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-12">
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
          <LayoutList /> TaskMaster
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium"
          >
            <Settings size={18} /> Settings
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors font-medium"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto mt-10 px-4">
        {profile.first_name && (
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Hello, {profile.first_name}! 👋
          </h2>
        )}

        <form
          onSubmit={handleCreateTask}
          className="relative mb-8 shadow-sm rounded-xl overflow-hidden"
        >
          <input
            type="text"
            className="w-full p-5 pl-6 pr-16 text-lg border-none focus:ring-2 focus:ring-indigo-500 rounded-xl"
            placeholder="What needs to be done today?"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <button
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="absolute right-3 top-3 bottom-3 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <Plus size={24} />
          </button>
        </form>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <p className="text-gray-500 text-sm font-medium">
            {stats.active} task{stats.active !== 1 ? "s" : ""} remaining
          </p>
          <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            {["All", "Active", "Completed"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === f ? "bg-indigo-100 text-indigo-700" : "text-gray-500 hover:bg-gray-100"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <CheckCircle2 size={48} className="mx-auto mb-3 opacity-20" />
              <p>No tasks found in this view.</p>
            </div>
          ) : (
            <ul>
              {filteredTasks.map((task) => (
                <li
                  key={task.id}
                  className="group flex items-center justify-between p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-none"
                >
                  <div
                    className="flex items-center gap-4 cursor-pointer flex-1"
                    onClick={() => handleToggleComplete(task)}
                  >
                    <button
                      className={`${task.is_completed ? "text-green-500" : "text-gray-300 hover:text-indigo-400"} transition-colors`}
                    >
                      {task.is_completed ? (
                        <CheckCircle2 size={24} />
                      ) : (
                        <Circle size={24} />
                      )}
                    </button>
                    <span
                      className={`text-lg transition-all ${task.is_completed ? "line-through text-gray-400" : "text-gray-700"}`}
                    >
                      {task.title}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 p-2"
                    title="Delete task"
                  >
                    <Trash2 size={20} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;

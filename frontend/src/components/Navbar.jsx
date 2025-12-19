import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { History, LogOut, User } from "lucide-react"; // Optional icons for better look

export default function Navbar() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // To verify active route if needed

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* BRAND */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Accessibility Analyzer
          </span>
        </Link>

        {/* RIGHT SIDE */}
        {!loading && (
          <div className="flex items-center gap-4">
            {!user ? (
              // 🔒 GUEST VIEW
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition"
                >
                  Login
                </Link>
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition shadow-md hover:shadow-lg"
                >
                  Get Started
                </button>
              </>
            ) : (
              // 🔓 LOGGED IN VIEW
              <>
                {/* History Link */}
                <Link
                  to="/history"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition"
                >
                  <History className="w-4 h-4" />
                  <span className="text-sm font-medium">History</span>
                </Link>

                {/* User Info & Logout */}
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-xs text-gray-500">Signed in as</span>
                    <span className="text-sm font-semibold text-gray-800 max-w-[150px] truncate">
                      {user.email?.split("@")[0]}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-600 transition"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
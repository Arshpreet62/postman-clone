import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { useGlobal } from "./context/Context";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { setUser } = useGlobal();

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setLocation("/dashboard");
        } catch (error) {
          console.error("Failed to parse user data:", error);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      }
    };

    checkAuthStatus();
  }, [setLocation, setUser]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4 text-center relative">
      <h1 className="text-6xl font-extrabold text-blue-700 mb-4 drop-shadow-md">
        📨 Postman Clone
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-md">
        Your lightweight, modern API testing tool — built for speed and
        simplicity.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/signup">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg transition-all duration-200">
            Sign Up / Log In
          </button>
        </Link>
        <Link href="/dashboard">
          <button className="bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 font-semibold py-3 px-8 rounded-xl shadow-md transition-all duration-200">
            Try Demo
          </button>
        </Link>
      </div>
      <p className="text-sm text-gray-400 absolute bottom-4 right-4">
        v0.1 • Made with ❤️ by Arshpreet
      </p>
    </div>
  );
}

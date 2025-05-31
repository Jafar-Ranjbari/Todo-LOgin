import { useEffect } from "react";
import { useUserStore } from "../store/userStore";
import { useRouter } from "next/router";
import Cookies from "js-cookie";

const WelcomeBar = () => {
  const username = useUserStore((state) => state.username);
  const setUsername = useUserStore((state) => state.setUsername);
  const router = useRouter();

  useEffect(() => {
    const username = typeof window !== "undefined" ? localStorage.getItem("username") : null;
    setUsername(username);
  }, [setUsername]);

  const handleLogout = () => {
    localStorage.removeItem("username");
    Cookies.remove("token");
    setUsername(null);
    router.push("/");
  };

  if (!username) return null;

  return (
    <div className="w-full text-center py-4 bg-rose-100 text-rose-700 font-bold flex items-center justify-center gap-4 mb-6">
      <span>کاربر {username} خوش آمدی</span>
      <button
        onClick={handleLogout}
        className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-1 rounded transition"
      >
        خروج
      </button>
    </div>
  );
};

export default WelcomeBar;
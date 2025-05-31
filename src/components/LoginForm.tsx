import React, { useState } from "react";
import { useRouter } from "next/router";
import { generateToken, setToken } from "../utils/token";
import { useUserStore } from "../store/userStore";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const setUsernameStore = useUserStore((state) => state.setUsername);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "Admin" && password === "123456") {
      localStorage.setItem("username", username);
      setUsernameStore(username); // مقداردهی در zustand
      const token = generateToken();
      setToken(token); // فرض بر این است که setToken توکن را در کوکی ذخیره می‌کند
      router.push("/TodoList"); // به صفحه TodoList برو
    } else {
      setError("نام کاربری یا رمز عبور اشتباه است");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-rose-100 to-rose-300">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-rose-600 mb-6">
          ورود به حساب کاربری
        </h2>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              نام کاربری
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              رمز عبور
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          <button
            type="submit"
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 rounded-lg transition duration-200"
          >
            ورود
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
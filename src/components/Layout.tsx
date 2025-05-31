import Footer from "./Footer";
import { useEffect } from "react";
import { useUserStore } from "../store/userStore";

const Layout = (props: any) => {
  const { children, ...customMeta } = props;
  const setUsername = useUserStore((state) => state.setUsername);

  useEffect(() => {
    const username =
      typeof window !== "undefined" ? localStorage.getItem("username") : null;
    setUsername(username);
  }, [setUsername]);

  const username = useUserStore((state) => state.username);

  return (
    <div className="min-w-[350px] overflow-x-hidden font-vazir" dir="rtl">
      <main id="skip" className="bg-white dark:bg-neutral-900">
        {username && (
          <div className="w-full text-center py-4 bg-rose-100 text-rose-700 font-bold">
            کاربر {username} خوش آمدی
          </div>
        )}
        {children}
        <Footer />
      </main>
    </div>
  );
};

export default Layout;

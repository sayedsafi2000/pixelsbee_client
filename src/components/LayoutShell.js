"use client";
import Sidebar from "./Sidebar";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import { useAuth } from "./AuthProvider";

export default function LayoutShell({ children }) {
  const {
    user,
    login,
    register,
    loginOpen,
    registerOpen,
    closeLogin,
    closeRegister,
    switchToRegister,
    switchToLogin,
    handleLogin,
  } = useAuth();
  return (
    <>
      <div className="flex">
        <Sidebar onLogin={login} onRegister={register} user={user} />
        <div className="flex-1 md:pl-20 min-h-screen flex flex-col">
          {children}
        </div>
      </div>
      <LoginModal
        open={loginOpen}
        onClose={closeLogin}
        switchToRegister={switchToRegister}
        onLogin={handleLogin}
      />
      <RegisterModal
        open={registerOpen}
        onClose={closeRegister}
        switchToLogin={switchToLogin}
        onLogin={handleLogin}
      />
    </>
  );
}
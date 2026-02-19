import Logo from "@/components/Logo";
import LoginForm from "@/components/LoginForm";

export default function Home() {
  return (
    <main className="main-container">
      <div className="mobile-wrapper">
        <Logo />
        <LoginForm />
      </div>
    </main>
  );
}
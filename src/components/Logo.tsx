interface LogoProps {
  variant?: "light" | "dark";
}

const Logo = ({ variant = "dark" }: LogoProps) => {
  const isLight = variant === "light";

  return (
    <div className="logo">
      <div className={`logo-icon ${isLight ? "logo-icon-light" : "logo-icon-dark"}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 4v16M4 12h16"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span className={`logo-name ${isLight ? "logo-name-light" : "logo-name-dark"}`}>
        Shedula
      </span>
    </div>
  );
};

export default Logo;
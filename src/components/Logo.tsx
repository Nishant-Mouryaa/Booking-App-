const Logo = () => {
  return (
    <div className="logo-container">
      <div className="logo-box logo-animated">
        <div className="logo-overlay" />
        <div className="logo-content">
          <img 
            src="/logo.png" 
            alt="App Logo" 
            className="logo-image"
          />
        </div>
      </div>
    </div>
  );
};

export default Logo;
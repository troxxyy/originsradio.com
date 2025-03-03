import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-860">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4"></h1>
        <p className="text-7xl font-bold  font-avenir text-white font-size-123 mb-4">BURDA NE YAPIYORSUN :/</p>
        
        <a href="/" className="text-white-900 hover:text-blue-700 underline">
          Geri Dön
        </a>
      </div>
    </div>
  );
};

export default NotFound;

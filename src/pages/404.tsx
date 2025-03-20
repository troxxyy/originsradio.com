import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-860">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4"></h1>
        <p className="text-7xl font-bold font-avenir text-white font-size-123 mb-4">BURDA NE YAPIYORSUN :/</p>
        
        <Link to="/" className="text-white-900 hover:text-blue-700 underline">
          Geri Dön
        </Link>
      </div>
    </div>
  );
};

export default NotFound; 
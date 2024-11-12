import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found d-flex flex-column align-items-center">
      <img
        src="https://www.pngitem.com/pimgs/m/561-5616833_image-not-found-png-not-found-404-png.png"
        alt="not-found"
      />
      <button
        to="/"
        className="btn btn-lg btn-primary mt-5"
        onClick={() => navigate(-1)}
      >
        Go Back
      </button>
    </div>
  );
};

export default NotFound;

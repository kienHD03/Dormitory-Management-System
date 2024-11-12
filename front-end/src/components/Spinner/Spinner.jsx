import "./Spinner.css";

const Spinner = () => {
  return (
    <div className="spinner-border loading-spinner" role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;

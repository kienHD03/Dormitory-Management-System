import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./App.css";
import PublicRouter from "./routers/PublicRouter";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="app">
      <PublicRouter />
      <Toaster reverseOrder="false" />
    </div>
  );
}

export default App;

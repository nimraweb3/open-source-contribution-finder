import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Explore from "./pages/Explore";

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#fafafa] text-zinc-900">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;

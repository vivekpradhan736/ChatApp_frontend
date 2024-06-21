import "./App.css";
import { Route, Routes } from "react-router-dom";
import Homepage from "./Pages/Homepage.js";
import Chatpage from "./Pages/Chatpage.js";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route exact path="/" element={<Homepage />} />
        <Route path="/chats" element={<Chatpage />} />
      </Routes>
    </div>
  );
}

export default App;

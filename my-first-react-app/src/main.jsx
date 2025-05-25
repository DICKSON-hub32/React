import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import App from "./App.jsx";
import MovieDetails from "./MovieDetails.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <nav className="bg-gray-800 p-4 text-white">
        <ul className="flex space-x-6 justify-center">
          <li><Link to="/" className="hover:underline">Home</Link></li>
          <li><Link to="/trending" className="hover:underline">Trending</Link></li>
          <li><a href="/privacy" className="hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
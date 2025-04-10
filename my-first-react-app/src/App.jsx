import React, { useEffect, useState } from "react";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "./appwrite";
import Feedback from "./sections/Feedback"; // Import Feedback
import Footer from "./sections/Footer"; // Import Footer

const API_BASE_URL = "https://api.themoviedb.org/3";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`
  }
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 900, [searchTerm]);

  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error("An error occurred while fetching movies.");
      }

      const data = await response.json();

      if (data.Response === "False") {
        setErrorMessage(data.Error || "Failed to fetch movies.");
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage("Failed to fetch movies. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  };
  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200); // Show button after scrolling 200px
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="relative">
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>
            Your Perfect <span className="text-gradient">Movies</span>, Found
            Fast
          </h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          {/* <h1 className="text-white">{searchTerm}</h1> */}
        </header>

        {/* Trending Movies Section */}
        {trendingMovies.length > 0 && (
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Trending Movies</h2>
            </div>

            <ul
              className="flex overflow-x-auto gap-4 pb-4 
    sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 
    sm:overflow-x-hidden"
            >
              {trendingMovies.map((movie) => (
                <li key={movie.$id} className="flex-shrink-0 w-36">
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-36 h-48 object-cover rounded-lg"
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies mt-8">
          <h2>All Movies</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
        {/* Add Feedback and Footer */}
        <Feedback />
        <Footer />
      </div>
      {/* Return to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 p-3 rounded-full bg-gradient-to-r from-[#D6C7FF] to-[#AB8BFF] text-white
          shadow-lg hover:bg-blue-700 transition-all duration-300 z-50
          ${showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`}
        aria-label="Return to top"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>
    </main>
  );
};

export default App;

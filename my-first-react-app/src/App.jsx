import React, { useEffect, useState } from "react";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "./appwrite";
import Feedback from "./sections/Feedback";
import Footer from "./sections/Footer";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 900, [searchTerm]);

  const fetchGenres = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/genre/movie/list`, API_OPTIONS);
      const data = await response.json();
      setGenres(data.genres || []);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  const fetchMovies = async (query = "", page = 1, genreId = "") => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      let endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=${page}`;
      
      if (genreId) {
        endpoint += `&with_genres=${genreId}`;
      }

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) throw new Error("An error occurred while fetching movies.");
      const data = await response.json();

      if (data.results?.length === 0) {
        setErrorMessage("No movies found.");
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

  const handleGenreChange = (e) => {
    const genreId = e.target.value;
    setSelectedGenre(genreId);
    setCurrentPage(1);
    fetchMovies(debouncedSearchTerm, 1, genreId);
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    fetchGenres();
    loadTrendingMovies();
  }, []);

  useEffect(() => {
    fetchMovies(debouncedSearchTerm, currentPage, selectedGenre);
  }, [debouncedSearchTerm, currentPage, selectedGenre]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className={`relative min-h-screen ${theme === "dark" ? "dark bg-black text-white" : "bg-gray-100 text-gray-900"}`}>
      <div className="pattern" />
      <div className="wrapper max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="relative">
          <img src="./hero.png" alt="Hero Banner" className="w-full h-auto" />
          <h1 className="text-3xl sm:text-4xl font-bold text-center mt-4">
            Your Perfect <span className="text-gradient">Movies</span>, Found Fast
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-6">
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <div className="flex items-center gap-4">
              <select
                value={selectedGenre}
                onChange={handleGenreChange}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg dark:bg-gray-800"
                aria-label="Select movie genre"
              >
                <option value="">All Genres</option>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>
              <button
                onClick={toggleTheme}
                className="p-2 bg-gray-700 text-white rounded-lg dark:bg-gray-800"
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </header>

        {trendingMovies.length > 0 && (
          <section className="mt-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Trending Movies</h2>
            </div>
            <ul className="flex overflow-x-auto gap-4 pb-4 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 sm:overflow-x-hidden">
              {trendingMovies.map((movie) => (
                <li key={movie.$id} className="flex-shrink-0 w-36">
                  <img
                    src={movie.poster_url}
                    alt={movie.searchTerm}
                    className="w-36 h-48 object-cover rounded-lg"
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies mt-8">
          <h2 className="text-2xl font-bold mb-6">All Movies</h2>
          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}

          <div className="flex gap-4 justify-center mt-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50 dark:bg-gray-800"
            >
              Previous
            </button>
            <span className="text-lg font-semibold text-white dark:text-gray-200">{currentPage}</span>
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-4 py-2 bg-gray-700 text-white rounded dark:bg-gray-800"
            >
              Next
            </button>
          </div>
        </section>

        <Feedback />
        <Footer />
      </div>

      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 p-3 rounded-full bg-gradient-to-r from-[#D6C7FF] to-[#AB8BFF] text-white shadow-lg transition-all duration-300 z-50 ${
          showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
        aria-label="Return to top"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </main>
  );
};

export default App;
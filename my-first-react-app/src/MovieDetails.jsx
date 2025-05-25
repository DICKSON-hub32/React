import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { saveRating } from "./appwrite";
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

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [streamingUrl, setStreamingUrl] = useState("");
  const [error, setError] = useState("");
  const [rating, setRating] = useState(0);
  const [showRatingInput, setShowRatingInput] = useState(false);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        console.log("API Key in MovieDetails:", API_KEY);
        console.log("Fetching movie details for ID:", id);
        const response = await fetch(`${API_BASE_URL}/movie/${id}`, API_OPTIONS);
        console.log("Movie Details Response:", response.status, response.statusText);
        if (!response.ok) {
          throw new Error(`TMDB error! status: ${response.status}, message: ${response.statusText}`);
        }
        const data = await response.json();
        setMovie(data);
      } catch (err) {
        setError(`Failed to fetch movie details: ${err.message}`);
      }
    };

    const fetchTrailer = async () => {
      try {
        console.log("Fetching trailer for ID:", id);
        const response = await fetch(`${API_BASE_URL}/movie/${id}/videos`, API_OPTIONS);
        console.log("Trailer Response:", response.status, response.statusText);
        if (!response.ok) {
          throw new Error(`TMDB error! status: ${response.status}, message: ${response.statusText}`);
        }
        const data = await response.json();
        const trailerVideo = data.results.find(
          (video) => video.type === "Trailer" && video.site === "YouTube"
        );
        setTrailer(trailerVideo);
      } catch (err) {
        console.error("Failed to fetch trailer:", err);
        setError(`Failed to fetch trailer: ${err.message}`);
      }
    };

    fetchMovieDetails();
    fetchTrailer();
  }, [id]);

  useEffect(() => {
    if (!movie) return; // Wait until movie is loaded

    const fetchStreamingLink = async () => {
      try {
        console.log("Fetching streaming link for ID:", id);
        const response = await fetch(`${API_BASE_URL}/movie/${id}/watch/providers`, API_OPTIONS);
        console.log("Streaming Link Response:", response.status, response.statusText);
        if (!response.ok) {
          throw new Error(`TMDB error! status: ${response.status}, message: ${response.statusText}`);
        }
        const data = await response.json();
        const country = "US";
        const providers = data.results?.[country]?.flatrate || [];
        const link = providers.length > 0 ? data.results[country].link : null;
        setStreamingUrl(link || `https://www.netflix.com/search?q=${encodeURIComponent(movie.title)}`);
      } catch (err) {
        console.error("Failed to fetch streaming link:", err);
        setStreamingUrl(`https://www.netflix.com/search?q=${encodeURIComponent(movie.title)}`);
      }
    };

    fetchStreamingLink();
  }, [id, movie]); // Depend on movie to ensure it's loaded

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 10) {
      setError("Rating must be between 1 and 10.");
      return;
    }
    setError("");
    try {
      await saveRating({ movieId: Number(id), rating, title: movie?.title || "Unknown" });
      setShowRatingInput(false);
      setRating(0);
    } catch (err) {
      setError("Failed to save rating. Please try again.", err.message);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-500">{error}</p>
        <Link to="/" className="text-blue-600 hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col">
      <main className="flex-grow">
        <div className="mb-6">
          <Link to="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <img
              src={
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
                  : "No-movie.png"
              }
              alt={`${movie.title} poster`}
              className="w-full rounded-lg shadow-lg"
            />
          </div>
          <div className="md:w-2/3">
            <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
            <div className="flex gap-2 text-gray-600 mb-4">
              <span>{movie.release_date ? movie.release_date.split("-")[0] : "N/A"}</span>
              <span>•</span>
              <span>{movie.runtime ? `${movie.runtime} min` : "N/A"}</span>
              <span>•</span>
              <span>{movie.genres?.map((g) => g.name).join(", ") || "N/A"}</span>
            </div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Overview</h2>
              <p className="text-gray-700">{movie.overview || "No summary available."}</p>
            </div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Rating</h2>
              <div className="flex items-center gap-2">
                <img src="/star.svg" alt="star Icon" className="w-5 h-5" />
                <p className="text-white">{movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"} ({movie.vote_count} votes)</p>
              </div>
            </div>
            <div className="mb-4">
              <a
                href={streamingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Watch Now
              </a>
              <p><span className="text-gray-400 text-sm italic">Hey, watch the trailer first—spoilers are cheaper than therapy!😄😄😄</span></p>
            </div>
            {trailer && (
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Trailer</h2>
                <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${trailer.key}`}
                    title={trailer.name}
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
                        <div className="mt-4 flex gap-2">
              <a
                href={`https://twitter.com/intent/tweet?text=Check out ${encodeURIComponent(movie.title)} on My Movie Site!&url=${window.location.href}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Share on X
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-800"
              >
                Share on Facebook
              </a>
            </div>
          </div>
        </div>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Feedback</h2>
          <div className="mb-4">
            <p className="flex items-center gap-2 text-white">
              <img src="/star.svg" alt="Star Icon" className="w-5 h-5" />
              TMDB Rating: {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"} ({movie.vote_count} votes)
            </p>
          </div>
          <button
            onClick={() => setShowRatingInput(!showRatingInput)}
            className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg mb-4"
            aria-label="Rate movie"
          >
            Rate This Movie
          </button>
          {showRatingInput && (
            <form onSubmit={handleRatingSubmit} className="flex gap-2">
              <input
                type="number"
                min="1"
                max="10"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="px-2 py-1 border rounded-lg bg-white text-gray-900 w-16"
                aria-label="Enter rating from 1 to 10"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Submit
              </button>
            </form>
          )}
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </section>
      </main>

      <Feedback />
      <Footer />
    </div>
  );
};

export default MovieDetails;
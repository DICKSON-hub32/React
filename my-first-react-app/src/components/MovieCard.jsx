import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { saveFavorite, removeFavorite, getUserFavorites, saveRating } from "../appwrite";

const MovieCard = ({
  movie: { id, title, vote_average, poster_path, release_date, original_language }
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [rating, setRating] = useState(0);
  const [showRatingInput, setShowRatingInput] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const favorites = await getUserFavorites();
        setIsFavorite(favorites.some((fav) => fav.movieId === id));
      } catch (error) {
        console.error("Error checking favorites:", error);
        setErrorMessage("");
      }
    };
    checkFavorite();
  }, [id]);

  const handleFavorite = async () => {
    setErrorMessage("");
    try {
      if (isFavorite) {
        await removeFavorite(id);
        setIsFavorite(false);
      } else {
        await saveFavorite({ movieId: id, title, poster_path });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      setErrorMessage("Failed to update favorite. Please try again.");
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 10) {
      setErrorMessage("Rating must be between 1 and 10.");
      return;
    }
    setErrorMessage("");
    try {
      await saveRating({ movieId: id, rating, title });
      setShowRatingInput(false);
      setRating(0);
    } catch (error) {
      console.error("Error saving rating:", error);
      setErrorMessage("Failed to save rating. Please try again.");
    }
  };

  return (
    <div className="movie-card">
      <Link to={`/movie/${id}`} className="relative">
        <img
          src={
            poster_path
              ? `https://image.tmdb.org/t/p/w500/${poster_path}`
              : "No-movie.png"
          }
          alt={title}
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            handleFavorite();
          }}
          className="absolute top-2 right-2 p-1 rounded-full bg-gray-800 bg-opacity-50 hover:bg-opacity-75"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <svg
            className="w-5 h-5"
            fill={isFavorite ? "#EF4444" : "none"}
            stroke={isFavorite ? "#EF4444" : "#6B7280"}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </Link>
      <div className="mt-4">
        <Link to={`/movie/${id}`}>
          <h3 className="hover:underline">{title}</h3>
        </Link>
        <div className="content">
          <div className="rating">
            <img src="star.svg" alt="Star Icon" />
            <p>{vote_average ? vote_average.toFixed(1) : "N/A"}</p>
          </div>
          <span>•</span>
          <p className="lang">{original_language}</p>
          <span>•</span>
          <p className="year">{release_date ? release_date.split("-")[0] : "N/A"}</p>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setShowRatingInput(!showRatingInput)}
            className="px-3 py-1 bg-gray-200 text-gray-900 rounded-lg"
            aria-label="Rate movie"
          >
            Rate
          </button>
        </div>
        {showRatingInput && (
          <form onSubmit={handleRatingSubmit} className="mt-2 flex gap-2">
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
              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Submit
            </button>
          </form>
        )}
        {errorMessage && (
          <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
        )}
      </div>
    </div>
  );
};

export default MovieCard;

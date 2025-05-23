import React, { useEffect, useState } from "react";
import { saveFavorite, removeFavorite, getUserFavorites, saveRating } from "../appwrite";

const WATCHMODE_API_KEY = import.meta.env.VITE_WATCHMODE_API_KEY;

const MovieCard = ({
  movie: { id, title, vote_average, poster_path, release_date, original_language }
}) => {
  const [watchUrl, setWatchUrl] = useState("");
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
        setErrorMessage("Failed to load favorites. Please try again.");
      }
    };
    checkFavorite();
  }, [id]);

  useEffect(() => {
    const fetchStreamingLink = async () => {
      const cacheKey = `watchmode_${encodeURIComponent(title)}`;
      const cached = localStorage.getItem(cacheKey);
      const now = Date.now();
      const cacheDuration = 24 * 60 * 60 * 1000;

      if (cached) {
        const { url, timestamp } = JSON.parse(cached);
        if (now - timestamp < cacheDuration) {
          setWatchUrl(url);
          return;
        }
      }

      try {
        const searchRes = await fetch(
          `https://api.watchmode.com/v1/search/?apiKey=${WATCHMODE_API_KEY}&search_field=name&search_value=${encodeURIComponent(title)}`
        );
        if (searchRes.status === 429) {
          console.error("Watchmode API rate limit exceeded (429)");
          setWatchUrl(`https://www.netflix.com/search?q=${encodeURIComponent(title)}`);
          return;
        }
        const searchData = await searchRes.json();
        let url = `https://www.netflix.com/search?q=${encodeURIComponent(title)}`;

        if (searchData.title_results?.length > 0) {
          const movieId = searchData.title_results[0].id;
          const sourcesRes = await fetch(
            `https://api.watchmode.com/v1/title/${movieId}/sources/?apiKey=${WATCHMODE_API_KEY}`
          );
          if (sourcesRes.status === 429) {
            console.error("Watchmode API rate limit exceeded (429)");
            setWatchUrl(url);
            return;
          }
          const sourcesData = await sourcesRes.json();
          if (Array.isArray(sourcesData)) {
            const firstLink = sourcesData.find((s) => s.web_url);
            if (firstLink?.web_url) {
              url = firstLink.web_url;
            }
          } else {
            console.error("Watchmode sources is not an array:", sourcesData);
          }
        }

        localStorage.setItem(cacheKey, JSON.stringify({ url, timestamp: now }));
        setWatchUrl(url);
      } catch (error) {
        console.error("Error fetching Watchmode link:", error);
        setWatchUrl(`https://www.netflix.com/search?q=${encodeURIComponent(title)}`);
      }
    };

    fetchStreamingLink();
  }, [title]);

  const handleFavorite = async () => {
    setErrorMessage(""); // Clear previous errors
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
      <a href={watchUrl} target="_blank" rel="noopener noreferrer" className="relative">
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
      </a>
      <div className="mt-4">
      <a href={watchUrl} target="_blank" rel="noopener noreferrer" className="relative"><h3>{title}</h3></a>
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
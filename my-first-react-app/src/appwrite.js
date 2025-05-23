import { Client, Databases, ID, Query } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const FAVORITES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_FAVORITES_COLLECTION_ID;
const RATINGS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_RATINGS_COLLECTION_ID;
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setSession(""); // Explicitly set to anonymous mode

const database = new Databases(client);

const getGuestId = () => {
  try {
    let guestId = localStorage.getItem("guestId");
    if (!guestId) {
      guestId = ID.unique();
      localStorage.setItem("guestId", guestId);
      console.log("Generated new guestId:", guestId);
    } else {
      console.log("Retrieved guestId:", guestId);
    }
    return guestId;
  } catch (error) {
    console.error("Failed to access localStorage:", error);
    const fallbackId = ID.unique();
    console.log("Using fallback guestId:", fallbackId);
    return fallbackId;
  }
};

export const updateSearchCount = async (searchTerm, movie) => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("searchTerm", searchTerm)
    ]);

    if (result.documents.length > 0) {
      const doc = result.documents[0];
      await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
        count: doc.count + 1
      });
    } else {
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm,
        count: 1,
        movie_id: movie.id,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      });
    }
  } catch (error) {
    console.error("Failed to update search count:", error.message, error.code, error.type);
  }
};

export const getTrendingMovies = async () => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(5),
      Query.orderDesc("count")
    ]);
    return result.documents;
  } catch (error) {
    console.error("Failed to fetch trending movies:", error.message, error.code, error.type);
    return [];
  }
};

export const saveFavorite = async ({ movieId, title, poster_path }) => {
  try {
    const data = {
      userId: getGuestId(),
      movieId,
      title,
      poster_url: poster_path ? `https://image.tmdb.org/t/p/w500/${poster_path}` : null,
      createdAt: new Date().toISOString(),
    };
    console.log("Saving favorite:", data);
    await database.createDocument(DATABASE_ID, FAVORITES_COLLECTION_ID, ID.unique(), data);
  } catch (error) {
    console.error("Failed to save favorite:", error.message, error.code, error.type);
    throw new Error("Failed to save favorite");
  }
};

export const removeFavorite = async (movieId) => {
  try {
    const response = await database.listDocuments(DATABASE_ID, FAVORITES_COLLECTION_ID, [
      Query.equal("movieId", movieId),
      Query.equal("userId", getGuestId()),
    ]);
    if (response.documents.length > 0) {
      await database.deleteDocument(DATABASE_ID, FAVORITES_COLLECTION_ID, response.documents[0].$id);
    }
  } catch (error) {
    console.error("Failed to remove favorite:", error.message, error.code, error.type);
    throw new Error("Failed to remove favorite");
  }
};

export const getUserFavorites = async () => {
  try {
    const response = await database.listDocuments(DATABASE_ID, FAVORITES_COLLECTION_ID, [
      Query.equal("userId", getGuestId()),
    ]);
    return response.documents;
  } catch (error) {
    console.error("Failed to fetch favorites:", error.message, error.code, error.type);
    throw new Error("Failed to fetch favorites");
  }
};

export const saveRating = async ({ movieId, rating, title }) => {
  try {
    const response = await database.listDocuments(DATABASE_ID, RATINGS_COLLECTION_ID, [
      Query.equal("movieId", movieId),
      Query.equal("userId", getGuestId()),
    ]);
    if (response.documents.length > 0) {
      await database.updateDocument(DATABASE_ID, RATINGS_COLLECTION_ID, response.documents[0].$id, {
        rating,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await database.createDocument(DATABASE_ID, RATINGS_COLLECTION_ID, ID.unique(), {
        userId: getGuestId(),
        movieId,
        rating,
        title,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Failed to save rating:", error.message, error.code, error.type);
    throw new Error("Failed to save rating");
  }
};
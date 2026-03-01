import dotenv from "dotenv";
dotenv.config();
export const PORT = process.env.PORT || 3000;
export const TMDB_API_KEY = process.env.TMDB_API_KEY || "";
export const TMDB_BASE_URL = process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3/";
export const TMDB_ACESS_TOKEN = process.env.TMDB_ACESS_TOKEN || "";
export const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
//# sourceMappingURL=envs.js.map
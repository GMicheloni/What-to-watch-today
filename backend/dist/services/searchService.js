import { TMDB_BASE_URL, TMDB_ACESS_TOKEN } from "../config/envs.js";
import { redisClient } from "../config/redis.js";
export const searchService = async (query) => {
    const reply = await redisClient.get("search:" + query);
    if (reply) {
        return JSON.parse(reply);
    }
    try {
        const response = await fetch(`${TMDB_BASE_URL}search/movie?query=${query}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${TMDB_ACESS_TOKEN}`,
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch search results: ${response.status}`);
        }
        const data = await response.json();
        const results = data.results.map((item) => ({
            id: item.id,
            title: item.title,
            poster_path: item.poster_path,
            release_date: item.release_date,
        }));
        const redisSet = await redisClient.set(`search:${query}`, JSON.stringify(results), {
            EX: 300,
        });
        return results;
    }
    catch (error) {
        throw new Error(`Error fetching search results: ${error}`);
    }
};
export const getMovieDetailsService = async (id) => {
    const reply = await redisClient.get("movie:" + id);
    if (reply) {
        return JSON.parse(reply);
    }
    try {
        const response = await fetch(`${TMDB_BASE_URL}movie/${id}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${TMDB_ACESS_TOKEN}`,
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch movie details: ${response.status}`);
        }
        const data = await response.json();
        const movieDetails = {
            id: data.id,
            title: data.title,
            poster_path: data.poster_path,
            release_date: data.release_date,
            overview: data.overview,
        };
        const redisSet = await redisClient.set(`movie:${id}`, JSON.stringify(movieDetails), {
            EX: 3000,
        });
        return movieDetails;
    }
    catch (error) {
        throw new Error(`Error fetching movie details: ${error}`);
    }
};
//# sourceMappingURL=searchService.js.map
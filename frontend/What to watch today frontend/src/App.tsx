import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import "./App.css";

type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  overview: string;
};

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [detail, setDetail] = useState<Movie | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [watchedMovies, setWatchedMovies] = useState<
    Pick<Movie, "title" | "poster_path">[]
  >([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timeout = setTimeout(() => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      fetch(
        `http://localhost:3000/api/search/?q=${encodeURIComponent(query)}`,
        {
          signal: controller.signal,
        },
      )
        .then((res) => res.json())
        .then((data: Movie[]) => {
          setResults(data);
          setIsOpen(true);
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.error(err);
          }
        });
    }, 400);

    return () => {
      clearTimeout(timeout);
      controllerRef.current?.abort();
    };
  }, [query]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleSelect = (movie: Movie) => {
    setQuery(movie.title);
    setIsOpen(false);

    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);

    fetch(`http://localhost:3000/api/movie/${movie.id}`)
      .then((res) => res.json())
      .then((data: Movie) => {
        setDetail(data);
      })
      .catch((err) => {
        console.error(err);
        setDetailError("No se pudo cargar el detalle");
      })
      .finally(() => {
        setDetailLoading(false);
      });
  };

  const getYear = (date: string) => {
    if (!date) return "";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "";
    return d.getFullYear().toString();
  };

  const getPosterUrl = (path: string | null) =>
    path ? `https://image.tmdb.org/t/p/w500${path}` : null;

  const isDetailOpen = detailLoading || detail !== null || Boolean(detailError);

  type RecommendationItem = {
    input_movie: string;
    movie: { id: number; title: string; release_date: string };
    reason: string;
  };

  type RecommendationWithPoster = RecommendationItem & {
    poster_path?: string | null;
  };

  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);
  const [recResults, setRecResults] = useState<RecommendationItem[] | null>(
    null,
  );
  const [recResultsWithPoster, setRecResultsWithPoster] = useState<
    RecommendationWithPoster[] | null
  >(null);

  const addToWatched = (movie: Pick<Movie, "title" | "poster_path">) => {
    setWatchedMovies((prev) => {
      if (!movie.title) return prev;
      if (prev.some((m) => m.title === movie.title) || prev.length >= 5)
        return prev;
      return [...prev, movie];
    });
  };

  const removeFromWatched = (title: string) => {
    setWatchedMovies((prev) => prev.filter((m) => m.title !== title));
  };

  const isWatchedFull = watchedMovies.length >= 5;

  useEffect(() => {
    if (!recResults || recResults.length === 0) {
      setRecResultsWithPoster(null);
      return;
    }

    const loadPosters = async () => {
      const enriched: RecommendationWithPoster[] = await Promise.all(
        recResults.map(async (item) => {
          try {
            const res = await fetch(
              `http://localhost:3000/api/movie/${item.movie.id}`,
            );
            if (!res.ok) return { ...item, poster_path: null };
            const data: Movie = await res.json();
            return { ...item, poster_path: data.poster_path };
          } catch (error) {
            console.error("Error fetching poster for recommendation:", error);
            return { ...item, poster_path: null };
          }
        }),
      );

      setRecResultsWithPoster(enriched);
    };

    loadPosters();
  }, [recResults]);

  const requestRecommendations = async () => {
    const body = { movies: watchedMovies.map((m) => m.title) };

    setRecLoading(true);
    setRecError(null);
    setRecResults(null);

    try {
      const response = await fetch("http://localhost:3000/api/recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      const data = await response.json();
      setRecResults(data);
    } catch (err) {
      console.error("No se pudo pedir recomendaciones:", err);
      setRecError("No se pudo recibir recomendaciones");
    } finally {
      setRecLoading(false);
    }
  };

  return (
    <div className="app" ref={containerRef}>
      <h1>What to watch today</h1>
      <p>
        Enter what you looked at these days that you liked, and we will make the
        best recommendations based on that.
      </p>

      <div className="search">
        <label htmlFor="searchInput">Buscar título</label>
        <input
          id="searchInput"
          value={query}
          onChange={handleInputChange}
          placeholder="e.g. Harry Potter"
          autoComplete="off"
        />
        {isOpen && results.length > 0 && (
          <ul className="dropdown" role="listbox">
            {results.map((movie) => (
              <li
                key={movie.id}
                role="option"
                tabIndex={0}
                className="dropdownItem"
                onClick={() => handleSelect(movie)}
              >
                <span className="movieTitle">{movie.title}</span>
                <span className="movieYear">{getYear(movie.release_date)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <section className="watched">
        <h2>Movies I watched and I liked</h2>
        <div className="watchedRow" role="list">
          {Array.from({ length: 5 }).map((_, index) => {
            const movie = watchedMovies[index];
            const hasMovie = Boolean(movie?.title);
            const posterUrl = movie ? getPosterUrl(movie.poster_path) : null;

            return (
              <div
                key={index}
                className={
                  "watchedCard" + (hasMovie ? " watchedCardFilled" : "")
                }
                role="listitem"
                aria-label={
                  hasMovie ? `Movie: ${movie.title}` : `Empty slot ${index + 1}`
                }
              >
                {hasMovie && (
                  <button
                    type="button"
                    className="watchedRemove"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWatched(movie.title);
                    }}
                    aria-label={`Remove ${movie.title}`}
                  >
                    ×
                  </button>
                )}
                <div
                  className="watchedPoster"
                  style={
                    posterUrl
                      ? { backgroundImage: `url(${posterUrl})` }
                      : undefined
                  }
                  aria-hidden="true"
                />
                <div
                  className={
                    "watchedTitle" + (hasMovie ? " watchedTitleFilled" : "")
                  }
                >
                  {hasMovie ? movie.title : ""}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="recommendationContainer">
        <button
          className="recommendButton"
          type="button"
          onClick={requestRecommendations}
          disabled={watchedMovies.length === 0}
        >
          Ask for recommendations
        </button>
      </div>

      {isDetailOpen && (
        <div
          className="overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setDetail(null)}
        >
          <div className="overlayContent" onClick={(e) => e.stopPropagation()}>
            <button
              className="overlayClose"
              onClick={() => setDetail(null)}
              aria-label="Close"
            >
              ×
            </button>

            {detailLoading ? (
              <p>Cargando...</p>
            ) : detailError ? (
              <p>{detailError}</p>
            ) : detail ? (
              <>
                {detail.poster_path && (
                  <img
                    className="detailPoster"
                    src={getPosterUrl(detail.poster_path) ?? undefined}
                    alt={`${detail.title} poster`}
                    width={500}
                    height={750}
                  />
                )}
                <h2>
                  {detail.title}{" "}
                  {detail.release_date
                    ? `(${getYear(detail.release_date)})`
                    : ""}
                </h2>
                <p>{detail.overview}</p>
                <button
                  className="addWatched"
                  type="button"
                  onClick={() =>
                    addToWatched({
                      title: detail.title,
                      poster_path: detail.poster_path,
                    })
                  }
                  disabled={
                    isWatchedFull ||
                    watchedMovies.some((m) => m.title === detail.title)
                  }
                >
                  {watchedMovies.some((m) => m.title === detail.title)
                    ? "Agregado"
                    : isWatchedFull
                      ? "Máximo alcanzado"
                      : "I saw it and I liked it"}
                </button>
              </>
            ) : null}
          </div>
        </div>
      )}

      {(recLoading || recError || recResults) && (
        <div
          className="overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => {
            if (!recLoading) {
              setRecError(null);
              setRecResults(null);
            }
          }}
        >
          <div className="overlayContent" onClick={(e) => e.stopPropagation()}>
            <button
              className="overlayClose"
              onClick={() => {
                setRecError(null);
                setRecResults(null);
              }}
              aria-label="Close"
            >
              ×
            </button>

            {recLoading ? (
              <div className="recLoading">
                <div className="spinner" aria-hidden="true" />
                <p>Estamos creando tus recomendaciones...</p>
              </div>
            ) : recError ? (
              <p>{recError}</p>
            ) : recResults ? (
              <div>
                <h3>Recomendaciones listas</h3>
                <ul className="recommendationList">
                  {(recResultsWithPoster ?? recResults).map((itemBase) => {
                    const item = itemBase as RecommendationWithPoster;
                    return (
                      <li key={item.input_movie} className="recommendationItem">
                        <strong> Because you liked {item.input_movie}</strong>
                        <div className="recommendationInner">
                          {item.poster_path ? (
                            <img
                              className="recommendationPoster"
                              src={getPosterUrl(item.poster_path) ?? undefined}
                              alt={`${item.movie.title} poster`}
                            />
                          ) : (
                            <div className="recommendationPosterEmpty" />
                          )}
                          <div>
                            <p>
                              {item.movie.title} ({item.movie.release_date})
                            </p>
                            <p className="reason">{item.reason}</p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      )}

      <footer style={{ opacity: 0.7, fontSize: 12 }} className="footer">
        <img src="/public/tmdb-logo.svg" alt="TMDB logo" height={20} />
        <span style={{ marginLeft: 8 }}>
          This product uses the TMDB API but is not endorsed or certified by
          TMDB.
        </span>
      </footer>
    </div>
  );
}

export default App;

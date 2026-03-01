import "./App.css";

function App() {
  let timeout: ReturnType<typeof setTimeout>;

  const fetchApi = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const input: String = formData.get("input") as string;
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      if (input.length < 2) return;
      console.log("Searching for:", input);
    }, 400);
  };

  return (
    <>
      <h1>What to watch today</h1>
      <p>
        Enter what you looked at these days that you liked, and we will make the
        best recommendations based on that
      </p>
      <form onChange={fetchApi} method="post">
        <label htmlFor="input">What did you watch?</label>
        <br />
        <input
          type="text"
          id="input"
          name="input"
          placeholder="e.g. The Lord of the Rings, The Matrix, etc."
        />
        <br />
      </form>
      <footer style={{ opacity: 0.7, fontSize: 12 }} className="footer">
        <img src="/public/tmdb-logo.svg" alt="TMDB logo" height={20} />
        <span style={{ marginLeft: 8 }}>
          This product uses the TMDB API but is not endorsed or certified by
          TMDB.
        </span>
      </footer>
    </>
  );
}

export default App;

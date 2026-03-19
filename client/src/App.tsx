import { useState } from "react";
import "./App.css";

export function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </>
  );
}

type Video = { url: string; title: string; description: string };

export function Video(video: Video) {
  return (
    <div>
      {/* <Thumbnail video={video} /> */}
      <a href={video.url}>
        <h3>{video.title}</h3>
        <p>{video.description}</p>
      </a>
      {/* <LikeButton video={video} /> */}
    </div>
  );
}

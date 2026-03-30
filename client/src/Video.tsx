type Video = {
  url: string
  title: string
  description: string
}

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
  )
}

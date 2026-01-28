import Upload from "./components/upload"
import VideoPlayer from "./components/videoplayer"

const App = () => {
    return (
        <div className="container">
            <h1>Video Streaming Platform Bobby</h1>
            <Upload />
            <VideoPlayer />
        </div>
    )
}

export default App
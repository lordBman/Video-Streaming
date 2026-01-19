import Upload from "./components/upload"
import VideoPlayer from "./components/videoplayer"
import "./styles.css"

const App = () => {
    return (
        <div className="container">
            <h1>Video Streaming Platform</h1>
            <Upload />
            <VideoPlayer />
        </div>
    )
}

export default App
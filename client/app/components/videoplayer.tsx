import { useEffect, useRef, type ChangeEventHandler } from "react";
import { formatQualityName, type VideoInfo } from "../../../common";
import { useVideoPlayer } from "../../player-provider";
import VideoItem from "./video-item";
import { useCallbackRequest } from "../requests";

const getVideoInfo = async(videoId: string): Promise<VideoInfo> => {
    try {
        const response = await fetch(`/video/${videoId}/info`)
        return await response.json()
    } catch (error) {
        console.error('Failed to get video info:', error)
    }
    throw Error('Failed to fetch video info');
}

const VideoPlayer = () => {
    const { videoState } = useVideoPlayer();
    const videoPlayerRef = useRef<HTMLVideoElement>(null);

    const changeQuality: ChangeEventHandler<HTMLSelectElement> = async(event) => {
        const quality = event.target.value
        if (!quality || !videoState.current) return

        const videoSource = document.getElementById('videoSource') as HTMLSourceElement
        videoSource.src = `/stream/${videoState.current}/${quality}/playlist.m3u8`
        videoPlayerRef.current?.load()
        videoPlayerRef.current?.play().catch(console.error)
    }

    const { data: videoInfo, loading, start } = useCallbackRequest<VideoInfo, string>({
        request: getVideoInfo,
        onDone: (data) => {
            //videoPlayerRef.current?.load()
            // Auto-play (optional)
            //videoPlayerRef.current?.play().catch(console.error)
        }
    });

    useEffect(() => {
        if(videoState.current){
            start(videoState.current);
        }
    }, [videoState.current]);
    
    return (
        <div className="player-container">
           { loading && <div className="loading-indicator">Loading video info...</div> }
           { !loading && videoInfo && (
                <video id="videoPlayer" ref={videoPlayerRef} controls>
                    <source id="videoSource" src={`/stream/${videoState.current}/master.m3u8`} type="application/x-mpegURL" />
                    Your browser does not support the video tag.
                </video>
           )}
            <div className="quality-selector">
                <select id="qualitySelect" onChange={changeQuality} value="">
                    <option value="">Select Quality</option>
                    {videoInfo && videoInfo.qualities.map(quality => (
                        <option key={quality} value={quality}>{formatQualityName(quality)}</option>
                    )) }
                </select>
            </div>
            <div className="video-grid" id="videoGrid">
                { videoState.videoGrid.map(video => (
                    <VideoItem key={video.videoId} videoId={video.videoId} name={video.name} />
                )) }
            </div>
        </div>
    );
}

export default VideoPlayer;
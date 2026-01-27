import { useEffect, useRef, type ChangeEventHandler } from "react";
import { formatQualityName } from "../../../common";
import { useVideoPlayer } from "../../player-provider";
import VideoItem from "./video-item";

const VideoPlayer = () => {
    const { videoState } = useVideoPlayer();
    const videoPlayerRef = useRef<HTMLVideoElement>(null);
    const videoSourceRef = useRef<HTMLSourceElement>(null);

    const changeQuality: ChangeEventHandler<HTMLSelectElement> = async(event) => {
        const quality = event.target.value
        if (!quality || !videoState.current) return

        const currentSeek = videoPlayerRef.current!.currentTime;
        videoSourceRef.current!.src = `/api/stream/${videoState.current.id}/${quality}/playlist.m3u8`
        videoPlayerRef.current?.load()
        videoPlayerRef.current?.play().then(()=>{
            videoPlayerRef.current!.currentTime = currentSeek;
        }).catch(console.error)

    }

    useEffect(() => {
        if(videoState.current && videoSourceRef.current){
            videoSourceRef.current.src = `/api/stream/${videoState.current.id}/master.m3u8`
            videoPlayerRef.current?.load()
            videoPlayerRef.current?.play().catch(console.error)
        }
    }, [videoSourceRef.current, videoState.current]);
    
    return (
        <div className="player-container">
           { videoState.current && (
                <video id="videoPlayer" ref={videoPlayerRef} controls >
                    <source id="videoSource" ref={videoSourceRef} type="application/x-mpegURL" />
                    Your browser does not support the video tag.
                </video>
            )}
            <div className="quality-selector">
                <select id="qualitySelect" onChange={changeQuality} value="">
                    <option value="">Select Quality</option>
                    <option value={"stream_3"}>{formatQualityName("360p")}</option>
                    <option value={"stream_2"}>{formatQualityName("480p")}</option>
                    <option value={"stream_1"}>{formatQualityName("720p")}</option>
                    <option value={"stream_0"}>{formatQualityName("1080p")}</option>
                </select>
            </div>
            <div className="video-grid" id="videoGrid">
                { videoState.videoGrid.map(video => (
                    <VideoItem key={video.id} video={video} />
                )) }
            </div>
        </div>
    );
}

export default VideoPlayer;
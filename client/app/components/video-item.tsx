import type React from "react";
import { useRef, useState } from "react";
import type { VideoInfo } from "../../../common";
import { useVideoPlayer } from "../../player-provider";

type VideoItemProps = {
    video: VideoInfo;

}

const VideoItem: React.FC<VideoItemProps> = ({ video }) => {
    const { setCurrent } = useVideoPlayer();

    const thumbnailUrl = `/api/thumbnail/${video.id}/${video.thumbnails[0]?.filename}`;
    const [showPreview, setShowPreview] = useState(false);

    const previewVideoRef = useRef<HTMLVideoElement>(null);
        
    const handleMouseEnter: React.MouseEventHandler<HTMLDivElement> = async(event) => {
        let playing = false;
        previewVideoRef.current!.currentTime = 0
        previewVideoRef.current!.play().then(()=> {
            playing = true;
            setShowPreview(true)
        }).catch((error) => {
            console.error('Error playing preview video:', error);
        });

        event.currentTarget.onmouseleave = () =>{
            if(playing){
                previewVideoRef.current!.pause();
            }
            setShowPreview(false)
        }
    }

    const handleClick: React.MouseEventHandler<HTMLDivElement> = () => {
        setCurrent(video);
    }

    return (
        <div className="video-item" onMouseEnter={handleMouseEnter} onClick={handleClick}>
            <img src={thumbnailUrl} alt={video.name} className="video-thumbnail" style={{ display: showPreview ? 'none' : 'block' }} />
            <video className="video-preview" muted preload="none" ref={previewVideoRef} loop src={`/api/preview/${video.id}`} style={{ display: showPreview ? 'block' : 'none' }} />
            <div className="video-info">
                <div className="video-title">{video.name}</div>
                <span className="video-quality">HD</span>
            </div>
        </div>
    );
}

export default VideoItem;
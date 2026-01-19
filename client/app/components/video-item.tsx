import type React from "react";
import { useRef, useState } from "react";

type VideoItemProps = {
    videoId: string;
    name: string;
}

const VideoItem: React.FC<VideoItemProps> = ({ videoId, name }) => {
    const thumbnailUrl = `/thumbnail/${videoId}/0`;
    const [previewLoaded, setPreviewLoaded] = useState(false);

    const previewVideoRef = useRef<HTMLVideoElement>(null);
    const thumbnailRef = useRef<HTMLImageElement>(null);
        
    

    const loadPreview = async (videoId: string, startTime: number): Promise<Blob> => {
        const response = await fetch(`/preview/${videoId}/${startTime}`)
        return await response.blob()
    }
        
    const handleMouseEnter: React.MouseEventHandler<HTMLDivElement> = async(event) => {
        if (!previewLoaded) {
            try {
                // Load 3-second preview starting from 30 seconds
                const previewBlob = await loadPreview(videoId, 30)
                previewVideoRef.current!.src = URL.createObjectURL(previewBlob)
                setPreviewLoaded(true)
            } catch (error) {
                console.error('Failed to load preview:', error)
            }
        }

        if (previewVideoRef.current!.src) {
            previewVideoRef.current!.currentTime = 0
            previewVideoRef.current!.play().catch(() => {
                // If autoplay fails, show thumbnail
                previewVideoRef.current!.style.display = 'none'
                thumbnailRef.current!.style.display = 'block'
            })
            previewVideoRef.current!.style.display = 'block'
            thumbnailRef.current!.style.display = 'none'
        }
    }

    const handleMouseLeave: React.MouseEventHandler<HTMLDivElement> = () => {
        previewVideoRef.current!.pause()
        previewVideoRef.current!.style.display = 'none'
        thumbnailRef.current!.style.display = 'block'
    }

    return (
        <div className="video-item" onMouseLeave={handleMouseLeave} onMouseEnter={handleMouseEnter}>
            <img src={thumbnailUrl} alt={name} className="video-thumbnail" ref={thumbnailRef} />
            <video className="video-preview" muted preload="none" ref={previewVideoRef} />
            <div className="video-info">
                <div className="video-title">{name}</div>
                <span className="video-quality">HD</span>
            </div>
        </div>
    );
}

export default VideoItem;
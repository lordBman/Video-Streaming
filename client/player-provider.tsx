import type React from "react";
import { createContext, useContext, useState } from "react";

interface VideoGrid{
    videoId: string;
    name: string;
}

export type VideoState = {
    current?: string;
    isPlaying: boolean;

    videoGrid: VideoGrid[];
}

export interface VideoPlayerContextType {
    videoState: VideoState;

    setCurrent: (videoId: string) => void;
    play: () => void;
    pause: () => void;
    addVideoToGrid: (videoId: string, name: string) => void;
}

export const VideoPlayerContext = createContext<VideoPlayerContextType | null>(null);
export const useVideoPlayer = () => {
    const init = useContext(VideoPlayerContext);
    if(init === null){
        throw Error("Component has to be wrapped by VideoPlayerProvider in order to call VideoPlayerContext");
    }
    return init;
}


const VideoPlayerProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [videoState, setVideoState] = useState<VideoState>({ isPlaying: false, videoGrid: [] });

    const setCurrent = (videoId: string) => {
        setVideoState(prev => ({ ...prev, current: videoId }));
    };

    const play = () => {
        setVideoState(prev => ({ ...prev, isPlaying: true }));
    };

    const pause = () => {
        setVideoState(prev => ({ ...prev, isPlaying: false }));
    };

    const addVideoToGrid = (videoId: string, name: string) => {
        setVideoState(prev => ({
            ...prev,
            videoGrid: [...prev.videoGrid, { videoId, name }]
        }));
    };

    return (
        <VideoPlayerContext.Provider value={{ videoState, setCurrent, play, pause, addVideoToGrid }}>
            {children}
        </VideoPlayerContext.Provider>
    );
}

export default VideoPlayerProvider;
import type React from "react";
import { createContext, useContext, useState } from "react";
import { useRequest } from "./app/requests";
import type { VideoInfo } from "../common";

export type VideoState = {
    current?: VideoInfo;
    isPlaying: boolean;

    videoGrid: VideoInfo[];
}

export interface VideoPlayerContextType {
    videoState: VideoState;

    setCurrent: (video: VideoInfo) => void;
    play: () => void;
    pause: () => void;
    addVideoToGrid: (videoInfo: VideoInfo) => void;
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

    const setCurrent = (video: VideoInfo) => {
        console.log('Setting current video:', video);
        setVideoState(prev => ({ ...prev, current: video }));
    };

    const play = () => {
        setVideoState(prev => ({ ...prev, isPlaying: true }));
    };

    const pause = () => {
        setVideoState(prev => ({ ...prev, isPlaying: false }));
    };

    const addVideoToGrid = (videoInfo: VideoInfo) => {
        setVideoState(prev => ({
            ...prev,
            videoGrid: [...prev.videoGrid, videoInfo]
        }));
    };

    const { loading } = useRequest<VideoInfo[]>({
        fn: async () =>{
            const response = await fetch('/api/videos');
            if (response.ok) {
                return await response.json();
            }
            throw Error('Failed to fetch video list');
        },
        onDone: (data) => {
            setVideoState(prev => ({
                ...prev, videoGrid: data, current: data[0]
            }));
        }
    });

    return (
        <VideoPlayerContext.Provider value={{ videoState, setCurrent, play, pause, addVideoToGrid }}>
            { loading ? <div className="loading-indicator">Loading videos...</div> : children }
        </VideoPlayerContext.Provider>
    );
}

export default VideoPlayerProvider;
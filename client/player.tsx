import { StrictMode, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import Controls from './app/components/controls';

const Player = () =>{
    const videoRef = useRef<HTMLVideoElement>(null);

    const [isPlaying, setPlaying] = useState(false);
    const [playState, setPlayState] = useState<{duration: number, current: number}>({ duration: 0, current: 0 });
    
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    // Update progress bar as video plays
    const timeUpdate:  React.ReactEventHandler<HTMLVideoElement> = (event) => {
        setPlayState(init => ({ ...init, current: videoRef.current?.currentTime ?? 0 })) 
    };

    const onPlayClicked = () =>{
        if(isPlaying){
            videoRef.current?.pause()
        }else{
            videoRef.current?.play()
        }
    }

    const durationChange: React.ReactEventHandler<HTMLVideoElement> = (event) => {
        setPlayState(init => ({ ...init, 
            duration: videoRef.current?.duration ?? 0,
            current: videoRef.current?.currentTime ?? 0
        }))
    }

    const seek = (value: number) => videoRef.current!.currentTime = value

    return (
        <>
            <video className="video" ref={videoRef} onDurationChange={durationChange}  onPlay={onPlay} onPause={onPause} onTimeUpdate={timeUpdate}>
                <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                Your browser does not support HTML video.
            </video>
            <Controls isPlaying={isPlaying} play={onPlayClicked} current={playState.current} duration={playState.duration} seek={seek}/>
        </>
    );
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Player />
    </StrictMode>,
)
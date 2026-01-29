import { StrictMode, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import Controls from './app/components/controls';

const Player = () =>{
    const videoRef = useRef<HTMLVideoElement>(null);

    const [isPlaying, setPlaying] = useState(false);
    
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    const videoStateChange: React.FormEventHandler<HTMLVideoElement> = (event) =>{
        
    }

    const onPlayClicked = () =>{
        if(isPlaying){
            videoRef.current?.pause()
        }else{
            videoRef.current?.play()
        }
    }

    return (
        <>
            <video className="video" id="video" ref={videoRef} onChange={videoStateChange} onPlay={onPlay} onPause={onPause}>
                <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                Your browser does not support HTML video.
            </video>
            <Controls isPlaying={isPlaying} play={onPlayClicked}/>
        </>
    );
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Player />
    </StrictMode>,
)
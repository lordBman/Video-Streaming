import { StrictMode, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import Controls from './app/components/controls';

const Player = () =>{
    const videoRef = useRef<HTMLVideoElement>(null);

    const [isPlaying, setPlaying] = useState(false);
    const [playState, setPlayState] = useState<{duration: number, current: number}>({ duration: 0, current: 0 });
    const [volumeState, setVolumeState] = useState<{ muted: boolean, value: number }>();
    const [maximized, setMaximized] = useState(false);
    
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    useEffect(()=>{
        if(videoRef.current && volumeState === undefined){
            console.log(videoRef.current.volume)
            setVolumeState({ muted: videoRef.current.muted, value: videoRef.current.volume });
        }
    }, [videoRef.current])

    const onPlayClicked = () =>{
        if(isPlaying){
            videoRef.current?.pause()
        }else{
            videoRef.current?.play()
        }
    }

    const videoChange = () => {
        setPlayState(init => ({ ...init, 
            duration: videoRef.current?.duration ?? 0,
            current: videoRef.current?.currentTime ?? 0,
        }))

        setVolumeState(init => ({ ...init!,
            value: (videoRef.current?.volume ?? 0) * 100, 
            muted: videoRef.current?.muted ?? true }));
    }

    const seek = (value: number) => videoRef.current!.currentTime = value
    const handleVolumeChange = (volume: number)=> videoRef.current!.volume = volume / 100;
    const handleMuted = (muted: boolean) => videoRef.current!.muted = muted;

    return (
        <>
            <video 
                className="video" 
                ref={videoRef} 
                onPlay={onPlay} 
                onPause={onPause}  
                onVolumeChange={videoChange}
                onDurationChange={videoChange}
                onTimeUpdate={videoChange}>
                <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                Your browser does not support HTML video.
            </video>
            <Controls 
                isPlaying={isPlaying} 
                play={onPlayClicked} 
                current={playState.current} 
                duration={playState.duration}
                maximized={maximized}
                toggleMaximize={()=> setMaximized((init)=> !init)}
                seek={seek} 
                volume={volumeState?.value ?? 0}
                muted={volumeState?.muted ?? true}
                volumeChange={handleVolumeChange}
                muteChange={handleMuted} />
        </>
    );
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Player />
    </StrictMode>,
)
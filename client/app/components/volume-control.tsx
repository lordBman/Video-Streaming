import type React from "react";
import { useEffect, useState } from "react";
import SeekBar from "./seek-bar";

interface VolumeControlProps{
    muted: boolean,
    volume: number,

    onMute?: (muted: boolean) => void,
    onVolumeChange?: (volume: number) => void
}

const VolumeControl: React.FC<VolumeControlProps> = ({ muted, volume, onMute, onVolumeChange }) =>{
    const [show, setShow] = useState(false);

    const controlEnter = () => setShow(true);
    const controlLeave = () => setShow(false);

    const onclick = () =>{
        if(onMute){
            onMute(!muted);
        }
    }

    return (
        <span className="control-options" onMouseEnter={controlEnter} onTouchStart={controlEnter} onMouseLeave={controlLeave} onTouchEnd={controlLeave}>
            { !muted && <span className="qlementine-icons--speaker-2-16" onClick={onclick}></span> }
            { muted && <span className="qlementine-icons--speaker-mute-16" onClick={onclick} ></span> }
            { show && (
                <div style={{ width: "180px" }}>
                    <SeekBar  onSeek={onVolumeChange} current={volume} total={100}/>
                </div>
            ) }
        </span>
    );
}

export default VolumeControl;
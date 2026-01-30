import React from "react";
import SeekBar from "./seek-bar";

interface ControlsProps{
    isPlaying: boolean
    current?: number

    play?: () => void
    seek?: (value: number) => void
}

const Controls: React.FC<ControlsProps> = ({ isPlaying, play, current, seek }) =>{
    return (
        <div className="controls" >
            <SeekBar current={current ?? 0} onSeek={seek}/>
            <div style={{ display: "flex", flexDirection: "row", width: "100%", gap: "20px" }}>
                <span className="control-options" onClick={play}>
                    <span className={ isPlaying ? "qlementine-icons--pause-16" : "qlementine-icons--play-16" }></span>
                </span>
                <span className="control-options">
                    <span className="qlementine-icons--speaker-2-16"></span>
                </span>
                <span className="control-options control-options-text">0:14 / 1:00:49</span>
                <span style={{ flex: 1 }}></span>
                <div className="control-options">
                    <span className="control-options-text">autoplay</span>
                    <span className="qlementine-icons--settings-16"></span>
                    <span className="qlementine-icons--fullscreen-16"></span>
                </div>
            </div>
        </div>
    );
}

export default Controls
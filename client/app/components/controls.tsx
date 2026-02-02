import React from "react";
import SeekBar from "./seek-bar";
import IOSSwitch from "./ios-switch";
import TimelineControl from "./timeline-control";
import VolumeControl from "./volume-control";

interface ControlsProps{
    isPlaying: boolean
    current?: number
    duration?: number
    volume: number
    muted: boolean

    play?: () => void
    seek?: (value: number) => void
    volumeChange?: (value: number) => void
    muteChange?: (value: boolean) => void
}

const Controls: React.FC<ControlsProps> = ({ isPlaying, play, current, volume, muted, duration, seek, volumeChange, muteChange }) =>{
    const formatTime = (time: number) => time.toFixed(0).padStart(2, "0");

    return (
        <div className="controls" >
            <TimelineControl current={current ?? 0} onTimeChnage={seek} duration={duration}/>
            <div style={{ display: "flex", flexDirection: "row", width: "100%", gap: "20px" }}>
                <span className="control-options" onClick={play}>
                    <span className={ isPlaying ? "qlementine-icons--pause-16" : "qlementine-icons--play-16" }></span>
                </span>
                <span className="control-options control-options-text">{formatTime((current ?? 0) / 60)}:{formatTime((current ?? 0) % 60)} / {formatTime((duration ?? 0) / 60)}:{formatTime((duration ?? 0) % 60)}</span>
                <VolumeControl volume={volume} onVolumeChange={volumeChange} muted={muted} onMute={muteChange}/>
                <span style={{ flex: 1 }}></span>
                <div className="control-options" style={{ cursor: "default" }}>
                    <span className="control-options-text">
                        <span style={{ display: "flex", flexDirection: "row", gap: 8, alignItems: "center" }}>
                            Auto Play
                            <IOSSwitch label="Autoplay" name="Autoplay"/>
                        </span>
                    </span>
                    <span className="qlementine-icons--settings-16"></span>
                    <span className="qlementine-icons--fullscreen-16"></span>
                </div>
            </div>
        </div>
    );
}

export default Controls
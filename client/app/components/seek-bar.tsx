import React, { useRef } from "react";

interface SeekBarProps{
    current: number
    duration?: number

    onSeek: (value: number) => void
}

const SeekBar: React.FC<SeekBarProps> = ({ current, duration, onSeek }) =>{
    const seekBarRef = useRef<HTMLElement>(null);

    let isDragging = false;
    
    const updateSeekBar = (clientX: number) => {
        const rect = seekBarRef.current!.getBoundingClientRect();
        let offsetX = clientX - rect.left;
        offsetX = Math.max(0, Math.min(offsetX, rect.width)); // clamp between 0 and width
        const percent = (offsetX / rect.width);
    
        video.currentTime = percent * video.duration;
    
        progress.style.width = `${percent * 100}%`;
        progress_thumb.style.left = `${percent * 100}%`;
        //valueDisplay.textContent = Math.round(percent);
    }

    return (
        <div style={{ width: "100%" }}>
            <p id="positionText">Cursor X: 0px</p>
            <div className="seekbar-handler" id="seekbar-handler">
                <div className="seekbar" id="seekbar">
                    <div className="progress" id="progress"></div>
                </div>
                <div className="progress-thumb" id="progress-thumb"></div>
            </div>
        </div>
    );
}

export default SeekBar;
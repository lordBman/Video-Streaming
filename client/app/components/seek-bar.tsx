import React, { useEffect, useRef, useState } from "react";

interface SeekBarProps{
    current: number
    total?: number

    onSeek?: (value: number) => void
    onHover?: (x: number) => void
    hoverEnd?: () => void
}

const SeekBar: React.FC<React.PropsWithChildren<SeekBarProps>> = ({ current, total, onSeek, onHover, hoverEnd, children }) =>{
    const seekBarHnadlerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setDragging] = useState(false);
    
    const updateSeekBar = (clientX: number) => {
        const rect = seekBarHnadlerRef.current!.getBoundingClientRect();
        let offsetX = clientX - rect.left;
        offsetX = Math.max(0, Math.min(offsetX, rect.width)); // clamp between 0 and width
        const percent = (offsetX / rect.width);
        if(onSeek){
            onSeek(percent * (total ?? 0))
        }
    }

    // Function to get horizontal cursor position relative to seekbar
    const getCursorPosition = (clientX: number) => {
        const rect = seekBarHnadlerRef.current!.getBoundingClientRect(); // Get seekbar position & size
        let x = clientX - rect.left; // Distance from left edge
        x = Math.max(0, Math.min(x, rect.width)); // Clamp between 0 and width
        return x;
    }

    useEffect(()=>{
        document.addEventListener('touchend', () => setDragging(false));
        document.addEventListener('touchmove', (e) => {
            if (isDragging && e.touches[0]) {
                updateSeekBar(e.touches[0].clientX);
            }
        });

        document.addEventListener('mouseup', () => {
            if(isDragging){
                setDragging(false);
            }
            
            if(hoverEnd){
                hoverEnd()
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                updateSeekBar(e.clientX);
            }
        });
    }, [])

    const touchStart: React.TouchEventHandler<HTMLDivElement> = () => setDragging(true)
    const mouseDown: React.MouseEventHandler<HTMLDivElement> = () => setDragging(true)
    const touchMove: React.TouchEventHandler<HTMLDivElement> = (event) => {
        if(onHover){
            const x = getCursorPosition(event.touches[0]!.clientX);
            onHover(x)
        }
    }
    const mouseMove: React.MouseEventHandler<HTMLDivElement> = (event) => {
        if(onHover){
            const x = getCursorPosition(event.clientX);
            onHover(x)
        }
    }

    const clicked: React.MouseEventHandler<HTMLDivElement> = (event) => updateSeekBar(event.clientX);

    return (
        <div style={{ width: "100%" }}>
            {children}
            <div className="seekbar-handler" ref={seekBarHnadlerRef} onMouseMove={mouseMove} onTouchMove={touchMove} onClick={clicked}>
                <div className="seekbar">
                    <div className="progress" style={{ width: `${current / (total ?? 0) * 100}%` }}></div>
                </div>
                <div className="progress-thumb" onTouchStart={touchStart} onMouseDown={mouseDown} style={{ left: `${current / (total ?? 0) * 100}%` }}></div>
            </div>
        </div>
    );
}

export default SeekBar;
import { useState } from "react";
import SeekBar from "./seek-bar";

interface TimelineControlProps{
    current: number
    duration?: number

    onTimeChnage?: (value: number) => void
}

const TimelineControl: React.FC<TimelineControlProps> = ({ current, duration, onTimeChnage}) =>{
    const [preview, setPreview] = useState<{ show: boolean, position: number, text: string }>({ show: false, position: 0, text: "" });

    const hovering = (x: number) =>{
        setPreview(init =>(
            {...init, text: `Cursor X: ${x.toFixed(2)}px`, show: true }
        ))
    }

    const hoveringEnd = () =>{
        if(preview.show){
            setPreview(init =>({...init, show: false }))
        }
    }
    
    return (
        <SeekBar onHover={hovering} hoverEnd={hoveringEnd} onSeek={onTimeChnage} current={current} total={duration}>
            { preview.show && (
                <p id="positionText">{ preview.text }</p>
            )}
        </SeekBar>
    );
}

export default TimelineControl;
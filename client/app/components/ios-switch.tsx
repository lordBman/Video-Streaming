import type React from "react";
import { useEffect, useState } from "react";

export interface SwitchProps{
    label: string,
    checked?: boolean,
    disabled?: boolean
    size?: "small" | "medium" | "large"
    name?: string,
    onChange?: (checked: boolean) => void;
}

const IOSSwitch: React.FC<SwitchProps> = (props) =>{
    const [isChecked, setChecked] = useState(props.checked || false);
    const [draggingState, setDraggingState] = useState<{ isDragging: boolean, dragOffset: number }>({ isDragging: false, dragOffset: 0 });

    //update internal state when props change
    useEffect(()=>{
        if(props.checked !== undefined){
            setChecked(props.checked);
        }
    }, [props.checked]);

    const getSizeClasses = () =>{
        switch(props.size){
            case "small":
                return { track: "ios-switch--small", thumb: "ios-switch__thumb--small" };
            case "large":
                return { track: "ios-switch--large", thumb: "ios-switch__thumb--large" };
            default:
                return { track: "ios-switch--medium", thumb: "ios-switch__thumb--medium" };
        }
    }
    const sizes = getSizeClasses();

    const handleToggle = () =>{
        if(props.disabled){
            return;
        }
        setChecked(init => {
            const newValue = !init;
            props.onChange?.(newValue);

            return newValue;
        });
    }

    const handleDragStart = (clientX: number) =>{
        if(props.disabled){
            return;
        }
        setDraggingState(init => ({ ...init, isDragging: true, dragOffset: clientX }))        
    }

    const handleDragMove = (clientX: number) =>{
        if(!draggingState.isDragging || props.disabled){
            return;
        }

        const movement = clientX - draggingState.dragOffset;

        if(Math.abs(movement) > 10){
            const shouldTurnOn = movement > 0;
            if(shouldTurnOn !== isChecked){
                setChecked(shouldTurnOn);
                props.onChange?.(shouldTurnOn);
            }
            setDraggingState(init => ({ ...init, isDragging: false }))
        }
    }

    const touchDown: React.TouchEventHandler<HTMLDivElement> = (event) =>{
        event.preventDefault();
        handleDragStart(event.touches[0]!.clientX)
    }

    const mouseDown: React.MouseEventHandler<HTMLDivElement> = (event) =>{
        event.preventDefault();
        handleDragStart(event.clientX);
    }

    const handleDragEnd = () => setDraggingState({ isDragging: false, dragOffset: 0 });

    //Global event listening fro drag
    useEffect(()=>{
        if(draggingState.isDragging){
            const handleMouseMove = (e: MouseEvent) => handleDragMove(e.clientX);
            const handleTouchMove = (e: TouchEvent) => handleDragMove(e.touches[0]!.clientX);
            const handleMouseUp = () => handleDragEnd();
            const handleTouchUp = () => handleDragEnd();

            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("touchmove", handleTouchMove);
            document.addEventListener("mouseup", handleMouseUp);
            document.addEventListener("touchend", handleTouchUp);

            return ()=>{
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("touchmove", handleTouchMove);
                document.removeEventListener("mouseup", handleMouseUp);
                document.removeEventListener("touchend", handleTouchUp);
            };
        }
    }, [draggingState.isDragging]);

    return (
        <div className={`ios-switch ${sizes.track} ${ isChecked ? 'ios-switch--on' : 'ios-switch--off'} ${props.disabled ? 'ios-switch--disabled' : ''} ${ draggingState.isDragging ? 'ios-switch--dragging' : '' }`}
            onClick={handleToggle} onMouseDown={mouseDown} onTouchStart={touchDown}
            role="switch" aria-checked={isChecked} aria-disabled={props.disabled}>
            <div className={`ios-switch__thumb ${sizes.thumb} ${draggingState.isDragging ? 'ios-switch__thumb--dragging' : ''}`} />
            <div className="ios-switch__icon ios-switch__icon--check"></div>
            <div className="ios-switch__icon ios-switch__icon--x"></div>
        </div>
    );
}

export default IOSSwitch;
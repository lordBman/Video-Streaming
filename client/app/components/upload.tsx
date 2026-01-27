import { useRef, useState } from "react";
import { useVideoPlayer } from "../../player-provider";

const Upload = () =>{
    const { setCurrent, addVideoToGrid } = useVideoPlayer();

    const [uploadEnabled, setUploadEnabled] = useState(true);
    const vidoeInputRef =  useRef<HTMLInputElement>(null);

    const uploadVideo = async() => {
        const file = vidoeInputRef.current?.files?.[0]
        if (!file) {
            alert('Please select a video file')
            return
        }
        
        const formData = new FormData()
        formData.append('video', file)
        
        try {
            setUploadEnabled(false) 
            const response = await fetch('/api/upload', { method: 'POST', body: formData })
            const result = await response.json()
            
            if (result.success) {
                setCurrent(result.videoInfo.id)
                addVideoToGrid(result.videoInfo);
            }
        } catch (error) {
            console.error('Upload failed:', error)
            alert('Upload failed. Please try again.')
        } finally {
            setUploadEnabled(true);
        }
    }

    return (
        <div className="upload-section">
            <input type="file" id="videoUpload" accept="video/*" ref={vidoeInputRef} />
            <button id="uploadBtn" onClick={uploadVideo} disabled={!uploadEnabled}>{uploadEnabled ? "Upload Video" : "Uploading..."}</button>
            <div id="uploadProgress"></div>
        </div>
    );
}

export default Upload;
const seekbar_handler = document.getElementById('seekbar-handler')!;
if(!seekbar_handler){
    throw Error("seekbar handler element not found")
}

const progress = document.getElementById('progress')!;
if(!progress){
    throw Error("progess element not found")
}

const progress_thumb = document.getElementById("progress-thumb")!
if(!progress_thumb){
    throw Error("progress_thumb element not found");
}

const positionText = document.getElementById('positionText')!;
if(!positionText){
    throw Error("position text element not found")
}

const video = document.getElementById('video') as HTMLVideoElement;
if(!video){
    throw Error("video element not found")
}

export { seekbar_handler, progress, progress_thumb, positionText, video }
/*class VideoStreamingPlayer {
    private videoPlayer: HTMLVideoElement
    private qualitySelect: HTMLSelectElement
    private videoGrid: HTMLDivElement
    //private uploadBtn: HTMLButtonElement
    //private videoUpload: HTMLInputElement
    private currentVideoId: string = ''
    
    constructor() {
        this.videoPlayer = document.getElementById('videoPlayer') as HTMLVideoElement
        this.qualitySelect = document.getElementById('qualitySelect') as HTMLSelectElement
        this.videoGrid = document.getElementById('videoGrid') as HTMLDivElement
        //this.uploadBtn = document.getElementById('uploadBtn') as HTMLButtonElement
        //this.videoUpload = document.getElementById('videoUpload') as HTMLInputElement
        
        this.initializeHLS()
        this.setupEventListeners()
        this.loadAvailableVideos()
    }
    
    private initializeHLS() {
        // For production, use hls.js library
        // This is a simplified version
        if (this.videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support
            this.videoPlayer.addEventListener('loadedmetadata', () => {
                console.log('Video metadata loaded')
            })
        } else {
            console.warn('HLS not natively supported. Consider using hls.js')
        }
    }
    
    private setupEventListeners() {
        this.uploadBtn.addEventListener('click', () => this.uploadVideo())
        this.qualitySelect.addEventListener('change', () => this.changeQuality())
        
        // Setup hover preview for video items
        this.setupHoverPreviews()
    }
    
       
    
    private setupVideoHover(videoItem: HTMLDivElement, videoId: string) {
        const previewVideo = videoItem.querySelector('.video-preview') as HTMLVideoElement
        const thumbnail = videoItem.querySelector('.video-thumbnail') as HTMLImageElement
        
        let previewLoaded = false
        
        videoItem.addEventListener('mouseenter', async () => {
            if (!previewLoaded) {
                try {
                    // Load 3-second preview starting from 30 seconds
                    const previewBlob = await this.loadPreview(videoId, 30)
                    previewVideo.src = URL.createObjectURL(previewBlob)
                    previewLoaded = true
                } catch (error) {
                    console.error('Failed to load preview:', error)
                }
            }
            
            if (previewVideo.src) {
                previewVideo.currentTime = 0
                previewVideo.play().catch(() => {
                    // If autoplay fails, show thumbnail
                    previewVideo.style.display = 'none'
                    thumbnail.style.display = 'block'
                })
                previewVideo.style.display = 'block'
                thumbnail.style.display = 'none'
            }
        })
        
        videoItem.addEventListener('mouseleave', () => {
            previewVideo.pause()
            previewVideo.style.display = 'none'
            thumbnail.style.display = 'block'
        })
    }
}

// Initialize the player when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new VideoStreamingPlayer()
})*/
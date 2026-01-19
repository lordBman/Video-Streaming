class VideoStreamingPlayer {
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
    
    private async uploadVideo() {
        const file = this.videoUpload.files?.[0]
        if (!file) {
            alert('Please select a video file')
            return
        }
        
        const formData = new FormData()
        formData.append('video', file)
        
        try {
            this.uploadBtn.disabled = true
            this.uploadBtn.textContent = 'Uploading...'
            
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            })
            
            const result = await response.json()
            
            if (result.success) {
                this.currentVideoId = result.videoId
                this.loadVideo(result.videoId)
                this.addVideoToGrid(result.videoId, file.name)
            }
        } catch (error) {
            console.error('Upload failed:', error)
            alert('Upload failed. Please try again.')
        } finally {
            this.uploadBtn.disabled = false
            this.uploadBtn.textContent = 'Upload Video'
        }
    }
    
    
    
    private async changeQuality() {
        const quality = this.qualitySelect.value
        if (!quality || !this.currentVideoId) return
        
        const videoSource = document.getElementById('videoSource') as HTMLSourceElement
        videoSource.src = `/stream/${this.currentVideoId}/${quality}/playlist.m3u8`
        this.videoPlayer.load()
        this.videoPlayer.play().catch(console.error)
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
    
    private setupHoverPreviews() {
        // Use Intersection Observer to lazy load previews
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const videoItem = entry.target as HTMLDivElement
                    const videoId = videoItem.dataset.videoId
                    
                    if (videoId) {
                        // Preload thumbnail
                        const thumbnail = videoItem.querySelector('.video-thumbnail') as HTMLImageElement
                        if (!thumbnail.src.includes('thumbnail')) {
                            thumbnail.src = `/thumbnail/${videoId}/0`
                        }
                    }
                }
            })
        }, { rootMargin: '50px' })
        
        // Observe all video items
        document.querySelectorAll('.video-item').forEach(item => {
            observer.observe(item)
        })
    }
}

// Initialize the player when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new VideoStreamingPlayer()
})
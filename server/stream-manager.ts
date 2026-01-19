import { existsSync, readdirSync } from 'fs'
import { join } from 'path'
import type { VideoInfo } from '../common'

export class StreamManager {
    private videos: Map<string, VideoInfo> = new Map()

    getVideoInfo = (videoId: string): VideoInfo | undefined => {
        const streamDir = join('streams', videoId)
        
        if (!existsSync(streamDir)) {
            return undefined
        }

        if (!this.videos.has(videoId)) {
            const qualities = readdirSync(streamDir).filter(item => !item.includes('.m3u8') && !item.includes('.ts'))
            this.videos.set(videoId, {
                id: videoId,
                qualities,
                duration: 0, // You'll need to calculate this from the video file
                thumbnails: []
            })
        }

        return this.videos.get(videoId)
    }

    getAvailableQualities = (videoId: string): string[] => {
        const videoInfo = this.getVideoInfo(videoId)

        return videoInfo?.qualities ?? []
    }
}
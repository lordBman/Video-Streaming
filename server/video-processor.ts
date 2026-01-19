import type { Blob } from 'buffer'
import type { BunFile } from 'bun'
import { spawn } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'

export class VideoProcessor {
    private ffmpegPath = 'ffmpeg'

    processVideo = async (inputPath: string, originalFilename: string, watermarkPath?: string): Promise<string> =>{
        const videoId = originalFilename.replace(/\.[^/.]+$/, "")
        const outputDir = join('streams', videoId)

        if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true })
        }

        // Define quality levels
        const qualities = [
            { name: '360p', resolution: '640x360', bitrate: '600k' },
            { name: '480p', resolution: '854x480', bitrate: '1000k' },
            { name: '720p', resolution: '1280x720', bitrate: '2500k' },
            { name: '1080p', resolution: '1920x1080', bitrate: '5000k' }
        ]

        // Generate master playlist
        let masterPlaylist = '#EXTM3U\n#EXT-X-VERSION:3\n'

        // Process each quality
        for (const quality of qualities) {
            const segmentDir = join(outputDir, quality.name)
            mkdirSync(segmentDir, { recursive: true })

            const watermarkFilter = watermarkPath 
                ? `[0:v]scale=${quality.resolution}[scaled];[scaled][1:v]overlay=10:10[outv]`
                : `[0:v]scale=${quality.resolution}[outv]`

            const args = [
                '-i', inputPath,
                ...(watermarkPath ? ['-i', watermarkPath] : []),
                '-filter_complex', watermarkFilter,
                '-map', '[outv]',
                '-map', '0:a',
                '-c:v', 'libx264',
                '-b:v', quality.bitrate,
                '-c:a', 'aac',
                '-b:a', '128k',
                '-f', 'hls',
                '-hls_time', '4',
                '-hls_playlist_type', 'vod',
                '-hls_segment_filename', join(segmentDir, 'segment_%03d.ts'),
                '-hls_flags', 'independent_segments',
                join(segmentDir, 'playlist.m3u8')
            ]

            await this.runFFmpeg(args)
      
            // Add to master playlist
            const bandwidth = this.getBandwidth(quality.bitrate)
            masterPlaylist += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${quality.resolution}\n`
            masterPlaylist += `${quality.name}/playlist.m3u8\n`
        }

        // Save master playlist
        Bun.write(join(outputDir, 'master.m3u8'), masterPlaylist)
    
        // Generate thumbnails
        await this.generateThumbnails(inputPath, videoId)
    
        return videoId
    }

    generateThumbnail = async (videoId: string, time: number): Promise<BlobPart[]> =>{
        const inputPath = join('uploads', `${videoId}.mp4`)
        const tempOutput = join('thumbnails', `${videoId}_${time}.jpg`)

        const args = [
            '-ss', time.toString(),
            '-i', inputPath,
            '-frames:v', '1',
            '-q:v', '2',
            '-f', 'image2',
            tempOutput
        ]

        return new Promise((resolve, reject) => {
            const ffmpeg = spawn(this.ffmpegPath, args)
            const chunks: BlobPart[] = []

            ffmpeg.stdout.on('data', (chunk) => chunks.push(chunk))
            ffmpeg.stderr.on('data', () => {}) // Ignore stderr

            ffmpeg.on('close', (code) => {
                if (code === 0) {
                    resolve(chunks)
                } else {
                    reject(new Error(`FFmpeg failed with code ${code}`))
                }
            })
        })
    }

    generatePreview = async (videoId: string, startTime: number): Promise<BlobPart[]> => {
        const inputPath = join('uploads', `${videoId}.mp4`)
        const tempOutput = join('previews', `${videoId}_preview.mp4`)

        const args = [
            '-ss', startTime.toString(),
            '-i', inputPath,
            '-t', '10',
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-b:v', '1000k',
            '-b:a', '128k',
            '-f', 'mp4',
            tempOutput
        ]

        return new Promise((resolve, reject) => {
            const ffmpeg = spawn(this.ffmpegPath, args)
            const chunks: BlobPart[] = []
            ffmpeg.stdout.on('data', (chunk) => chunks.push(chunk))
            ffmpeg.stderr.on('data', () => {}) // Ignore stderr
            ffmpeg.on('close', (code) => {
                if (code === 0) {
                    resolve(chunks)
                } else {
                    reject(new Error(`FFmpeg failed with code ${code}`))
                }
            })
        })
    }

    // Generate thumbnails every 10 seconds
    private generateThumbnails = async (inputPath: string, videoId: string): Promise<void> => {
        const thumbnailDir = join('thumbnails', videoId)
        mkdirSync(thumbnailDir, { recursive: true })

        const args = [
            '-i', inputPath,
            '-vf', 'fps=1/10',
            '-q:v', '2',
            '-s', '160x90',
            join(thumbnailDir, 'thumb_%03d.jpg')
        ]

        await this.runFFmpeg(args)
    }

    private runFFmpeg = (args: string[]): Promise<void> => {
        return new Promise((resolve, reject) => {
            const ffmpeg = spawn(this.ffmpegPath, args)
            ffmpeg.stderr.on('data', (data) => {
                console.error(`FFmpeg stderr: ${data}`)
            })
            ffmpeg.on('close', (code) => {
                if (code === 0) {
                    resolve()
                } else {
                    reject(new Error(`FFmpeg exited with code ${code}`))
                }
            })
        })
    }

    private getBandwidth = (bitrate: string): number => {
        const num = parseInt(bitrate.replace('k', ''))
        return num * 1000 * 1.5 // Add 50% overhead
    }
}
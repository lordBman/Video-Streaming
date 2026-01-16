import { spawn } from 'child_process'
import { existsSync, mkdirSync, readdirSync } from 'fs'
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

    generateThumbnail = async (videoId: string, time: number): Promise<Buffer> =>{
        const inputPath = join('uploads', `${videoId}.mp4`)
        const tempOutput = join('thumbnails', `${videoId}_${time}.jpg`)

        const args = [
            '-ss', time.toString(),
            '-i', inputPath,
            '-frames:v', '1',
            '-q:v', '2',
            '-f', 'image2',
            '-'
        ]

        return new Promise((resolve, reject) => {
            const ffmpeg = spawn(this.ffmpegPath, args)
            const chunks: Buffer[] = []

            ffmpeg.stdout.on('data', (chunk) => chunks.push(chunk))
            ffmpeg.stderr.on('data', () => {}) // Ignore stderr

            ffmpeg.on('close', (code) => {
                if (code === 0) {
                    resolve(Buffer.concat(chunks))
                } else {
                    reject(new Error(`FFmpeg failed with code ${code}`))
                }
            })
        })
    }
}
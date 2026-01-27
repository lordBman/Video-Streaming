import { spawn } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const ffmpegPath = 'ffmpeg'

const runFFmpeg = (args: string[]): Promise<void> => {
    return new Promise((resolve, reject) => {
        const ffmpeg = spawn(ffmpegPath, args)
        ffmpeg.stderr.on('data', (data) => {
            console.log('ffmpgeg data:', data.toString())
        })
        ffmpeg.on('close', (code) => {
            if (code === 0) {
                resolve()
            } else {
                reject(`FFmpeg exited with code ${code}`)
            }
        })
    })
}

const processVideo = async (inputPath: string, originalFilename: string, watermarkPath?: string) =>{
    const videoId = originalFilename.replace(/\.[^/.]+$/, "")
    const outputDir = join('streams', videoId)

    if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true })
    }

    const args = [
        '-i', inputPath,
        '-filter_complex', `[0:v]split=4[v1][v2][v3][v4]; [v1]scale=w=1920:h=1080[v1out]; [v2]scale=w=1280:h=720[v2out]; [v3]scale=w=854:h=480[v3out]; [v4]scale=w=640:h=360[v4out]`,
        '-map', "[v1out]", '-c:v:0', 'libx264', '-b:v:0', '5000k', '-maxrate:v:0', '5350k', '-bufsize:v:0', '7500k',
        '-map', "[v2out]", '-c:v:1', 'libx264', '-b:v:1', '2800k', '-maxrate:v:1', '2996k', '-bufsize:v:1', '4200k',
        '-map', "[v3out]", '-c:v:2', 'libx264', '-b:v:2', '1400k', '-maxrate:v:2', '1498k', '-bufsize:v:2', '2100k',
        '-map', "[v4out]", '-c:v:3', 'libx264', '-b:v:3', '750k', '-maxrate:v:3', '787.5k', '-bufsize:v:3' , '1575k',
        '-map' , "a:0", "-c:a", "aac", "-b:a:0", "192k", "-ac", "2",
        "-map", "a:0", "-c:a", "aac", "-b:a:1", "128k", "-ac", "2",
        '-map', 'a:0', '-c:a', 'aac', '-b:a:2', '98k', '-ac', '2',
        '-map', 'a:0', '-c:a', 'aac', '-b:a:3', '64k', '-ac', '2',
        '-f', 'hls',
        '-hls_time', '10',
        '-hls_playlist_type', 'vod',
        '-hls_segment_type', 'mpegts',
        '-hls_flags', 'independent_segments',
        '-hls_segment_filename', join(outputDir, 'stream_%v/data%03d.ts'),
        '-master_pl_name', 'master.m3u8',
        '-var_stream_map', "v:0,a:0 v:1,a:1 v:2,a:2 v:3,a:3",
        join(outputDir, 'stream_%v/playlist.m3u8')
    ]

    await runFFmpeg(args)

    return videoId
}

const generateThumbnail = async (videoId: string, time: number): Promise<BlobPart[]> =>{
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
        const ffmpeg = spawn(ffmpegPath, args)
        const chunks: BlobPart[] = []

        ffmpeg.stdout.on('data', (chunk) => chunks.push(chunk))
        ffmpeg.stderr.on('data', () => {}) // Ignore stderr

        ffmpeg.on('close', (code) => {
            if (code === 0) {
                resolve(chunks)
            } else {
                reject(`FFmpeg failed with code ${code}`)
            }
        })
    })
}

processVideo("./input.mp4", "input.mp4").then(() => {
    console.log("Video processing completed.")
}).catch((err) => {
    console.error("Error processing video:", err)
})

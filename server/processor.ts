import { spawn } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const ffmpegPath = 'ffmpeg'

/**
 * Executes FFmpeg CLI commands with the given arguments.
 * @param {string[]} args - The arguments to pass to FFmpeg CLI.
 * @returns {Promise<void>} A promise that resolves when FFmpeg execution completes.
 */
const runFFmpeg = (args: string[]): Promise<void> => {
    return new Promise((resolve, reject) => {
        const ffmpeg = spawn(ffmpegPath, args)
        ffmpeg.stderr.on('data', (data) => {
            console.log(data.toString())
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

/**
 * Generate thumbnails every 10 seconds
 * @param {string} videoId - The ID of the video.
 * @param {string} filename - The name of the file.
 * @returns {Promise<string[]>} A promise that resolves with an array of thumbnail filenames.
 */
const generateThumbnails = async (thumbnailDir: string, filePath: string): Promise<string[]> => {
    mkdirSync(thumbnailDir, { recursive: true })

    const args = [
        '-i', filePath,
        '-vf', 'fps=1/10',
        '-q:v', '2',
        '-s', '160x90',
        join(thumbnailDir, 'thumb_%03d.jpg')
    ]

    await runFFmpeg(args)

    // get list of generated thumbnails
    const thumbnails: string[] = []
    for (let i = 1; ; i++) {
        const thumb_name = `thumb_${String(i).padStart(3, '0')}.jpg`
        const thumbPath = join(thumbnailDir, thumb_name)
        if (existsSync(thumbPath)) {
            thumbnails.push(thumb_name)
        } else {
            break
        }
    }
    return thumbnails
}


/**
 * Processes a video file into multiple resolutions and bitrates then returns the video ID.
 * @param {string} videoId - The ID of the video.
 * @param {string} filename - The name of the file.
 * @returns {Promise<string>} A promise that resolves with the video ID.
 */
const processVideo = async (videoId: string, filename: string): Promise<string> => {
    const outputDir = join('streams', videoId)
    if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true })
    }

    const inputPath = join('uploads', filename)
    if (!existsSync("uploads")) {
        mkdirSync("uploads", { recursive: true })
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


/**
 * Generates a thumbnail for a video at a specific time.
 * @param {string} videoId - The ID of the video.
 * @param {string} filename - The name of the file.
 * @param {number} time - The time in seconds to generate the thumbnail.
 * @returns {Promise<[string, ArrayBuffer]>} A promise that resolves with the thumbnail name and data.
 */
const generateThumbnail = async (videoId: string, thumbnailPath: string, filename: string, time: number): Promise<[ string, ArrayBuffer ]> =>{
    const inputPath = join('uploads', filename)
    const tempOutput = join(thumbnailPath, `${videoId}_${time}.jpg`)
    if (!existsSync(thumbnailPath)) {
        mkdirSync(thumbnailPath, { recursive: true })
    }

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
        ffmpeg.stderr.on('data', (info) => console.log(info.toString()))
        ffmpeg.on('close', async (code) => {
            if (code === 0) {
                Bun.file(tempOutput).arrayBuffer().then(thumbnailData =>{
                    resolve([ tempOutput, thumbnailData ])
                }).catch(reject)
            } else {
                reject(`FFmpeg failed with code ${code}`)
            }
        })
    })
}

/**
 * Generates a preview for a video at a specific start time.
 * @param {string} videoId - The ID of the video.
 * @param {number} startTime - The start time in seconds to generate the preview.
 * @returns {Promise<string>} A promise that resolves with the preview file path.
 */
const generatePreview = async (previewPath: string, filename: string, startTime: number): Promise<string> => {
    const inputPath = join('uploads', filename)
    mkdirSync(previewPath, { recursive: true })

    const args = [
        '-ss', startTime.toString(),
        '-i', inputPath,
        '-t', '10',
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-b:v', '1000k',
        '-b:a', '128k',
        '-f', 'mp4',
        join(previewPath, 'preview.mp4')
    ]

    return new Promise((resolve, reject) => {
        const ffmpeg = spawn(ffmpegPath, args)
        ffmpeg.stderr.on('data', (info) => console.log(info.toString()))
        ffmpeg.on('close', (code) => {
            if (code === 0) {
                resolve(previewPath)
            } else {
                reject(`FFmpeg failed with code ${code}`)
            }
        })
    })
}

export { processVideo, generateThumbnail, generateThumbnails, generatePreview };
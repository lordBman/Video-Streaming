import { spawn } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const ffmpegPath = 'ffmpeg'

const getBandwidth = (bitrate: string): number => {
    const num = parseInt(bitrate.replace('k', ''))
    return num * 1000 * 1.5 // Add 50% overhead
}

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

    // Define quality levels
    const qualities = [
        { name: '360p', width: 640, height: 360, bitrate: '600k', maxBitrate: '642k', bufsize: '900k' },
        { name: '480p', width: 854, height: 480, bitrate: '1000k', maxBitrate: '1084k', bufsize: '1500k' },
        { name: '720p', width: 1280, height: 720, bitrate: '2500k', maxBitrate: '2650k', bufsize: '3750k' },
        { name: '1080p', width: 1920, height: 1080, bitrate: '5000k', maxBitrate: '5350k', bufsize: '7500k' }
    ]

    // Generate master playlist
    //let masterPlaylist = '#EXTM3U\n#EXT-X-VERSION:3\n'

    // Process each quality
    for (const quality of qualities) {
        const segmentDir = join(outputDir, quality.name)
        mkdirSync(segmentDir, { recursive: true })

        /*const watermarkFilter = watermarkPath 
            ? `[0:v]scale=${quality.resolution}[scaled];[scaled][1:v]overlay=10:10[outv]`
            : `[0:v]scale=${quality.resolution}[outv]`*/


        /**
         * ffmpeg -i input_video.mp4 \
            -filter_complex \
                "[0:v]split=3[v1][v2][v3]; \
                [v1]scale=w=1920:h=1080[v1out]; \
                [v2]scale=w=1280:h=720[v2out]; \
                [v3]scale=w=854:h=480[v3out]" \
            -map "[v1out]" -c:v:0 libx264 -b:v:0 5000k -maxrate:v:0 5350k -bufsize:v:0 7500k \
            -map "[v2out]" -c:v:1 libx264 -b:v:1 2800k -maxrate:v:1 2996k -bufsize:v:1 4200k \
            -map "[v3out]" -c:v:2 libx264 -b:v:2 1400k -maxrate:v:2 1498k -bufsize:v:2 2100k \
            -map a:0 -c:a aac -b:a:0 192k -ac 2 \
            -map a:0 -c:a aac -b:a:1 128k -ac 2 \
            -map a:0 -c:a aac -b:a:2 96k -ac 2 \
            -f hls \
            -hls_time 10 \
            -hls_playlist_type vod \
            -hls_flags independent_segments \
            -hls_segment_type mpegts \
            -hls_segment_filename stream_%v/data%03d.ts \
            -master_pl_name master.m3u8 \
            -var_stream_map "v:0,a:0 v:1,a:1 v:2,a:2" \
            stream_%v/playlist.m3u8
         */

        const args = [
            '-i', inputPath,
            '-filter_complex', `[0:v]scale=w=${quality.width}:h=${quality.height}[vout]`,
            '-map', '[vout]', '-c:v', 'libx264', '-b:v', quality.bitrate, '-maxrate:', quality.maxBitrate, '-bufsize:v', quality.bufsize,
            '-map', 'a:0', '-c:a', 'aac', '-b:a', '192k', '-ac', '2',
            '-f', 'hls',
            '-hls_time', '10',
            '-hls_playlist_type', 'vod',
            '-hls_segment_type', 'mpegts',
            '-hls_flags', 'independent_segments',
            '-hls_segment_filename', `${segmentDir}/data%03d.ts`,
            `${segmentDir}/playlist.m3u8`
        ]

        await runFFmpeg(args)
    
        // Add to master playlist
        /*const bandwidth = getBandwidth(quality.bitrate)
        masterPlaylist += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${quality.resolution}\n`
        masterPlaylist += `${quality.name}/playlist.m3u8\n`*/
    }

    // Save master playlist
    //Bun.write(join(outputDir, 'master.m3u8'), masterPlaylist)

    //return videoId
}

processVideo("./input.mp4", "input.mp4").then(() => {
    console.log("Video processing completed.")
}).catch((err) => {
    console.error("Error processing video:", err)
})

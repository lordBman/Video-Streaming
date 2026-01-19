import { VideoProcessor } from './video-processor'
import { StreamManager } from './stream-manager'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'

import html from "../client/index.html"

// Ensure directories exist
const directories = ['uploads', 'streams', 'thumbnails']
directories.forEach(dir => {
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
    }
})

const videoProcessor = new VideoProcessor()
const streamManager = new StreamManager()

const server = Bun.serve({
    port: 3000,
    routes: {
        // Serve static files
        "/*": html,
        // Upload endpoint
        "/upload": {
            POST: async (req) => {
                const form = await req.formData()
                const file = form.get('file') as File | null

                if (!file) {
                    return Response.json({ error: 'No file uploaded' })
                }
                
                const filename = `${Date.now()}_${file.name.replace(/\s/g, '_')}`
                const uploadPath = join('uploads', filename)

                // Save the uploaded file
                await Bun.write(uploadPath, file)

                // Process the uploaded video
                const videoId = await videoProcessor.processVideo(uploadPath, file.name, "bsoft limited")

                return Response.json({ 
                    success: true, videoId, streamUrl: `/stream/${videoId}/master.m3u8`
                }, { status: 201 })
            }
        },
        // Video streaming endpoint
        "/stream/:videoId/:file":  {
            GET: async (req) => {
                const videoId = req.params.videoId
                const file = req.params.file
                const filePath = join('streams', videoId, file)
                
                if (!existsSync(filePath)) {
                    return Response.json({ error: 'File not found' }, { status: 404 })
                }

                return new Response(Bun.file(filePath))
            }
        },
        // Thumbnail generation endpoint
        '/thumbnail/:videoId/:time': {
            GET: async (req) => {
                const videoId = req.params.videoId
                const time = parseFloat(req.params.time)

                const thumbnail = await videoProcessor.generateThumbnail(videoId, time)
                return new Response(new Blob(thumbnail, { type: 'image/jpeg' }))
            }
        },
        // Preview video endpoint (short clip for hover)
        '/preview/:videoId/:startTime': {
            GET: async (req) => {
                const videoId = req.params.videoId
                const startTime = parseFloat(req.params.startTime)

                const preview = await videoProcessor.generatePreview(videoId, startTime)
                return new Response(new Blob(preview, { type: 'video/mp4' }))
            }
        },
        // Video info endpoint
        '/video/:videoId/info': {
            GET: async (req) => {
                const videoId = req.params.videoId
                const info = streamManager.getVideoInfo(videoId)
                if (!info){
                    return Response.json({ error: 'Video not found' }, { status: 404 })
                }
                return Response.json(info)
            }
        }
    }
})

console.log(`Server running at ${server.url}`);
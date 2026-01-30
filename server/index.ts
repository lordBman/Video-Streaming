import html from "../client/index.html"
import videoHtml from "../client/video.html";

import { handleFetchThumbnail, handleGetVideos, handlePreviewVideo, handleStreamFile, handleUpload, handleVideoInfo } from './controller'

const server = Bun.serve({
    port: 3000,
    routes: {
        // Serve static files
        "/*": html,
        "/video": videoHtml,
        // Upload endpoint
        "/api/upload": {
            POST: async (req) => {
                const form = await req.formData()
                const file = form.get('video') as File | null

                if (!file) {
                    return Response.json({ error: 'No file uploaded' }, { status: 400 })
                }

                const videoInfo = await handleUpload(file)
                return Response.json({ 
                    success: true, videoInfo, streamUrl: `/api/stream/${videoInfo.id}/master.m3u8`
                }, { status: 201 })
            }
        },
        // Video streaming endpoint
        "/api/stream/:videoId/*":  {
            GET: async (req) => {
                const videoId = req.params.videoId
                const url = decodeURI(req.url)
                const file = url.substring(url.indexOf(videoId) + videoId.length + 1)
                console.log(`Streaming file request: videoId=${videoId}, file=${file}`)
                const data = await handleStreamFile(videoId, file)

                return new Response(data, { headers: { 'Content-Type': 'application/x-mpegURL' } })
            }
        },
        // Thumbnail generation endpoint
        '/api/thumbnail/:videoId/:filename': {
            GET: async (req) => {
                const videoId = req.params.videoId
                const filename = req.params.filename

                const thumbnail = await handleFetchThumbnail(videoId, filename)
                return new Response(thumbnail, { headers: { 'Content-Type': 'image/jpeg' } });
            }
        },
        // Preview video endpoint (short clip for hover)
        '/api/preview/:videoId': {
            GET: async (req) => {
                const videoId = req.params.videoId

                const preview = await handlePreviewVideo(videoId)
                return new Response(preview, { headers: { 'Content-Type': 'video/mp4' } })
            }
        },
        // Video info endpoint
        '/api/video/:videoId/info': {
            GET: async (req) => {
                const videoId = req.params.videoId
                const info = await handleVideoInfo(videoId)
                if (!info){
                    return Response.json({ error: 'Video not found' }, { status: 404 })
                }
                return Response.json(info)
            }
        },
        // get list of videos endpoint
        '/api/videos': {
            GET: async () => {
                const videos = await handleGetVideos()
                return Response.json(videos)
            }
        }
    }
})

console.log(`Server running at ${server.url}`);
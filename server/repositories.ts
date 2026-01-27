import type { Thumbnail, Video, VideoInfo } from "../common";
import { db } from "./database";
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'

/**
 * Repository for managing video data.
 */
namespace VideoRepository {
    /*
    * Fetches all thumbnails for a given video ID.
    * @param {string} videoId - The ID of the video.
    * @returns {Promise<Thumbnail[]>} A promise that resolves with an array of Thumbnail objects.
    */
    export async function getThumbnails(videoId: string): Promise<Thumbnail[]> {
        const thumbnails = await db.thumbnail.findMany({
            where: { videoId: videoId }
        })
        return thumbnails;
    }

    /**
     * Saves thumbnails for a video on database.
     * @param {Object} thumbnailData - The data for the thumbnails.
     * @param {string} thumbnailData.videoId - The ID of the video.
     * @param {string[]} thumbnailData.thumbnails - The names of the thumbnails.
     * @returns {Promise<Thumbnail[]>} A promise that resolves with an array of Thumbnail objects.
     */
    export async function saveThumbnails(thumbnailData: { videoId: string, thumbnails: string[] }): Promise<Thumbnail[]> {
        const thumbnails: Thumbnail[] = [];
        for (const name of thumbnailData.thumbnails) {
            const thumbnail = await db.thumbnail.create({
                data: {
                    videoId: thumbnailData.videoId,
                    filename: name
                }
            });
            thumbnails.push(thumbnail);
        }
        return thumbnails;
    }

    /**
     * Fetches all videos.
     * @returns {Promise<VideoInfo[]>} A promise that resolves with an array of VideoInfo objects.
     */
    export async function all(): Promise<VideoInfo[]> {
        const videos = await db.video.findMany({ orderBy: { createdAt: 'asc' } });
        if(videos.length > 0){
            const videoInfos: VideoInfo[] = [];
            for (const video of videos) {
                if(video.processed){
                    const thumbnails = await getThumbnails(video.id);
                    videoInfos.push({ ...video, thumbnails });
                }else{
                    videoInfos.push({ ...video, thumbnails: [] });
                }
            }
            return videoInfos;
        }
        return []
    }

    /**
     * @description Fetches a video by its ID.
     * @param {string} videoId - The ID of the video.
     * @returns {Promise<VideoInfo>} A promise that resolves with the VideoInfo object.
     */
    export async function get(videoId: string): Promise<VideoInfo> {
        const streamDir = join('streams', videoId)
        if (!existsSync(streamDir)) {
            throw new Error('Video not found');
        }
        const video = await db.video.findUnique({ 
            where: { id: videoId },
            include: { thumbnails: true }
        });

        if(video){
            return video;
        }
        throw new Error('Video not found');
    }

    /**
     * @description Adds a new video to the database.
     * @param {Object} videoData - The data for the new video.
     * @param {string} videoData.id - The ID of the new video.
     * @param {string} videoData.name - The name of the new video.
     * @returns {VideoInfo} A promise that resolves with the added VideoInfo object.
     */
    export async function add(videoData: { id: string, name: string }): Promise<VideoInfo> {
        const video = await db.video.create({ data: { id: videoData.id, name: videoData.name, processed: false } });
        return { ...video, thumbnails: [] };
    }

    /**
     * Marks a video as processed.
     * @param {string} videoId - The ID of the video.
     * @returns {Promise<VideoInfo>} A promise that resolves with the updated VideoInfo object.
     */
    export async function markAsProcessed(videoId: string): Promise<VideoInfo> {
        const video = await db.video.update({ 
            where: { id: videoId }, data: { processed: true },
            include: { thumbnails: true } 
        });
        return video;
    }
}

/**
 * Repository for managing storage paths and saving files.
 */
namespace StorageRepository {
    /**
     * Returns the path for a video file.
     * @param {string} filename - The name of the file.
     * @returns {string} The path to the video file.
     */
    export function getVideoPath(filename: string): string {
        return join('uploads', filename);
    }

    /**
     * Returns the path for a stream file.
     * @param {string} videoId - The ID of the video.
     * @returns {string} The path to the stream file.
     */
    export function getStreamPath(videoId: string): string {
        return join('streams', videoId);
    }

    /**
     * Returns the path for a stream file.
     * @param {string} videoId - The ID of the video.
     * @returns {string} The path to the stream file.
     */
    export function getStreamFile(videoId: string, file: string): string {
        return join('streams', videoId, file);
    }

    /**
     * Returns the path for a thumbnail file.
     * @param {string} videoId - The ID of the video.
     * @returns {string} The path to the thumbnail folder.
     */
    export function getThumbnailPath(videoId: string): string {
        return join('streams', videoId, 'thumbnails');
    }

    /**
     * Returns the path for a preview file.
     * @param {string} videoId - The ID of the video.
     * @returns {string} The path to the preview file.
     */
    export function getPreviewPath(videoId: string): string {
        return join('streams', videoId);
    }

    /**
     * Saves a video file and returns the final filename.
     * @param {File} file - The file to save.
     * @returns {Promise<[string, string]>} A promise that resolves with the video ID and final filename of the file.
     */
    export const saveVideo = async (file: File ): Promise<[string, string]> => {
        const filename = `${Date.now()}_${file.name.replaceAll(/\s+/g, '_')}`;
        const videoId = filename.replace(/\.[^/.]+$/, "")
        const inputPath = join('uploads', filename)
    
        mkdirSync("uploads", { recursive: true })
        
        // Save the uploaded file
        await Bun.write(inputPath, file)
    
        return [ videoId, filename ]
    }
}

export { VideoRepository, StorageRepository };
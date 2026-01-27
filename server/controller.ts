import type { VideoInfo } from "../common";
import { generatePreview, generateThumbnail, generateThumbnails, processVideo } from "./processor";
import { StorageRepository, VideoRepository } from "./repositories";

/**
 * Handles the upload of a video file.
 * @param {File} file The video file to upload.
 * @returns {Promise<VideoInfo>} A promise that resolves with the uploaded video information.
 */
const handleUpload = async (file: File): Promise<VideoInfo> => {
    const [videoId, filename] = await StorageRepository.saveVideo(file);
    const videoInfo: VideoInfo = await VideoRepository.add({ id: videoId, name: file.name });

    processVideo(videoId, filename).then(async () => {
        const thumbnailDir = StorageRepository.getThumbnailPath(videoId);
        const thumbnails = await generateThumbnails(thumbnailDir, StorageRepository.getVideoPath(filename));
        await VideoRepository.saveThumbnails({ videoId, thumbnails });
        await generatePreview(StorageRepository.getPreviewPath(videoId), filename, 0).catch(console.error);
        await VideoRepository.markAsProcessed(videoId);
    }).catch(console.error);

    return videoInfo;
}

/**
 * @description Handles fetching video information.
 * @param {string} videoId The ID of the video.
 * @returns {Promise<VideoInfo>} A promise that resolves with the video information.
 */
const handleVideoInfo = async (videoId: string): Promise<VideoInfo> => {
    const info = await VideoRepository.get(videoId);
    if (!info){
        throw new Error('Video not found');
    }
    return info;
}

/**
 * @description Handles fetching the list of all videos.
 * @returns {Promise<VideoInfo[]>} A promise that resolves with the list of all videos.
 */
const handleGetVideos = async (): Promise<VideoInfo[]> => {
    return await VideoRepository.all();
}

/**
 * Serves a file from the file system.
 * @param {string} filePath The path to the file to serve.
 * @returns {Promise<ArrayBuffer>} A promise that resolves with the file data.
 */
const handleServeFile = async (filePath: string): Promise<ArrayBuffer> => {
    return Bun.file(filePath).arrayBuffer();
}

/**
 * Serves a file from the file system.
 * @param {string} videoId The ID of the video.
 * @param {string} file The path to the file to serve.
 * @returns {Promise<ArrayBuffer>} A promise that resolves with the file data.
 */
const handleStreamFile = async (videoId: string, file: string): Promise<ArrayBuffer> => {
    const filePath = StorageRepository.getStreamFile(videoId, file);
    return await Bun.file(filePath).arrayBuffer();
}

/**
 * Generates a thumbnail for a video at a specific time.
 * @param {string} videoId 
 * @param {number} time 
 * @returns {Promise<ArrayBuffer>} A promise that resolves with the thumbnail data.
 */
const handleGenerateThumbnail = async (videoId: string, time: number): Promise<ArrayBuffer> => {
    const videoInfo = await VideoRepository.get(videoId);
    const thumbnailPath = StorageRepository.getThumbnailPath(videoId);
    const [_, thumbnailData] = await generateThumbnail(videoId, thumbnailPath, videoInfo.id, time);
    return thumbnailData;
}

/**
 * Generates a thumbnail for a video at a specific time.
 * @param {string} videoId 
 * @param {number} time 
 * @returns {Promise<ArrayBuffer>} A promise that resolves with the thumbnail data.
 */
const handleFetchThumbnail = async (videoId: string, filename: string): Promise<ArrayBuffer> => {
    const thumbnailPath = StorageRepository.getThumbnailPath(videoId);
    const thumbnailData = Bun.file(`${thumbnailPath}/${filename}`);
    return await thumbnailData.arrayBuffer();
}

/*
 * Handles the preview video request.
 * @param {string} videoId - The ID of the video.
 * @returns {Promise<ArrayBuffer>} A promise that resolves with the preview video data.
 */
const handlePreviewVideo = async (videoId: string): Promise<ArrayBuffer> => {
    const previewPath = StorageRepository.getPreviewPath(videoId);
    const previewFile = `${previewPath}/preview.mp4`;

    return await Bun.file(previewFile).arrayBuffer();
}

export { handleUpload, handleVideoInfo, handleGetVideos, handleServeFile, handleStreamFile, handleGenerateThumbnail, handleFetchThumbnail, handlePreviewVideo };
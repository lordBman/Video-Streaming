export interface VideoInfo {
    id: string
    qualities: string[]
    duration: number
    thumbnails: string[]
}

export const formatQualityName = (quality: string): string => {
    const qualityMap: Record<string, string> = {
        '360p': '360p (SD)',
        '480p': '480p (SD)',
        '720p': '720p (HD)',
        '1080p': '1080p (Full HD)'
    }
    return qualityMap[quality] || quality
}
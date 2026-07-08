import{ type Frame } from "./types";

export type FilterQuery = {
    author?: string;
    location?: string;
    round?: number;
    season?: string;
    award?: string;
}

export function filterFrames(frames: Frame[], query: FilterQuery) {
    return frames.filter(frame => {
        if (query.author && frame.author !== query.author) {
            return false;
        }
        if (query.location && frame.location !== query.location) {
            return false;
        }
        if (query.round !== undefined && frame.round !== query.round) {
            return false;
        }
        if (query.season && frame.season !== query.season) {
            return false;
        }
        if (query.award && frame.award !== query.award) {
            return false;
        }
        return true;
    });
}
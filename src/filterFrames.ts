import{ type Frame } from "./types";

export type FilterQuery = {
    author?: string;
    location?: string;
    round?: number;
    seasonId?: number;
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
        if (query.seasonId !== undefined && frame.seasonId !== query.seasonId) {
            return false;
        }
        return true;
    });
}

export type RollVisibilityQuery = {
    currentUser: string;
    currentRound: number;
}

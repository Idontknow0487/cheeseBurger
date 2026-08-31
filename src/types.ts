export type Frame = {
    id: number;
    author: string;
    timeTaken: string;
    location: string;
    round: number;
    seasonId: number;
    status: "draft" | "submitted";
    timeSource: TimeSource;
    image?: string;
};

export type TimeSource = "exif" | "manual";

//planned is purly for dev 
export type Season = {
    id: number;
    theme: string;
    status: "voting" |"planned" | "active" | "complete";
    currentRound: number;
    roundCount: number;
    // ISO dates. Two-week window per season; time-left is derived (endsAt - now)
    // at render, never stored. A backend will set these + status later.
    startsAt: string;
    endsAt: string;
};

export const AWARDS = {
    mostPeaceful: "Most peaceful",
    madeMeLaugh: "Made me laugh",
    mostSurprising: "Most surprising",
    bestComposition: "Best composition",
    mostCreative: "Most creative",
} as const;

export type AwardName = (typeof AWARDS)[keyof typeof AWARDS];

export type Award = {
    id: number;
    name: AwardName;
    frameId: number;
    seasonId: number;
};

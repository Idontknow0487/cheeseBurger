export type Frame = {
    id: number;
    author: string;
    timeTaken: string;
    location: string;
    round: number;
    seasonId: number;
    status: "draft" | "submitted";
    image?: string;
};
//planned is purly for dev 
export type Season = {
    id: number;
    theme: string;
    status: "voting" |"planned" | "active" | "complete";
    currentRound: number;
    roundCount: number;
};

// The fixed set of awards. Values are stable strings; the union type is derived
// from them so award names stay in sync with this object.
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

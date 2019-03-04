/**
 * data.ts
 *
 * This file defines a raw data set.
 */


const COUNT_SUBJECTS: number = 100;
const STATUSES: Status[] = [
    { index: 0, label: "Alpha",   probability: 0.05 },
    { index: 1, label: "Beta",    probability: 0.10 },
    { index: 2, label: "Gamma",   probability: 0.15 },
    { index: 3, label: "Delta",   probability: 0.20 },
    { index: 4, label: "Epsilon", probability: 0.50 }
];
const WEEKS: string[] = ["WEEK 0", "WEEK 1", "WEEK 2", "WEEK 3", "WEEK 4", "WEEK 5", "WEEK 6", "WEEK 7", "WEEK 8"];


function pickRandomStatus(): string {
    let r = Math.random();
    let cumulativeProbability = 0.0;
    for (let i = 0; i < STATUSES.length; i++) {
        cumulativeProbability += STATUSES[i].probability;
        if (r < cumulativeProbability) {
            return STATUSES[i].label;
        }
    }
    // Throw an error if we never found a status. This should never happen.
    throw Error(`No error for r = ${r}`);
}

export interface RawStatus {
    index: number;
    status: string;
    week: string;
}

export interface RawData {
    index: number;
    statuses: RawStatus[];
    subject: string;
}

export interface Status {
    index: number;
    label: string;
    probability: number;
}

let rawData: RawData[] = [];

for (let i = 0; i < COUNT_SUBJECTS; i++) {
    let datum: RawData = {
        index: i,
        statuses: [],
        subject: `S${i + 10001}`
    };
    for (let j = 0; j < WEEKS.length; j++) {
        let week = WEEKS[j];
        let status = pickRandomStatus();
        datum.statuses.push({ index: j, status: status, week: week });
    }
    rawData.push(datum);
}

export { rawData, STATUSES, WEEKS };

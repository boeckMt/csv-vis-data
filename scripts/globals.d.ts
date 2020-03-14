
export interface ICsvItem {
    new_cases: number;
    new_deaths: number;
    total_cases: number;
    total_deaths: number;
}

export interface ICsvData {
    daterage: { min: string, max: string, count: number };
    source: string;
    locations: { [ci: string]: number };
    dates: { [di: string]: { [ci: number]: ICsvItem } }
}
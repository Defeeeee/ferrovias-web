// TypeScript interfaces for the railway system

export interface TrainReport {
  station: string;
  time: number;
}

export interface Train {
  id: string;
  destination: string;
  reports: TrainReport[];
}

export interface TrainLocation {
  type: 'station' | 'between' | 'approaching_terminal';
  at?: string;
  from?: string;
  to?: string;
  percent?: number;
  description: string;
}

export interface TrainWithLocation extends Train {
  location: TrainLocation;
}

export interface APIData {
  [stationName: string]: {
    [trainDestId: string]: string[] | string;
  };
}

export interface DataSourceInfo {
  isLive: boolean;
  message: string;
  error?: string;
}
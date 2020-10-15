import { Coordinates } from './coordinates';

export interface Figure {
    key: number;
    coordinates: Coordinates[];
    canBeRotated: boolean;
    rotate: (coordinates: Coordinates[]) => Coordinates[];
    presenter: JSX.Element;
}
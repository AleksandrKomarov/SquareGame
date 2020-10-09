import { Coordinates } from './coordinates';

export interface Figure {
    coordinates: Coordinates[];
    canBeRotated: boolean;
    rotate: (coordinates: Coordinates[]) => Coordinates[];
    presenter: JSX.Element;
}
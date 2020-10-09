import { Figure } from '../figure';

export interface IFigureGenerator {
    getDefault: () => Figure;
    generate: () => Figure;
}
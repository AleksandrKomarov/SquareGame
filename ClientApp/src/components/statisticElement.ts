import { GameParameters } from './gameParameters/gameParameters';

export enum GameResult {
    Win,
    Loss,
    Draw,
    Undefined
}

export interface StatisticElement extends GameParameters {
    gameResult: GameResult;
}
import { RemoteGame } from '../remoteGame';

export enum ServerType {
    Local,
    Host,
    Remote
}

export enum OpponentType {
    Human,
    Computer
}

export enum GameType {
    Pvp,
    Pve
}

export enum FigureType {
    Dice,
    Tetris
}

export interface GameParameters {
    serverType: ServerType;
    remoteGame: RemoteGame | null;
    fieldSize: number;
    opponentType: OpponentType;
    playersCount: number;
    gameType: GameType;
    figureType: FigureType;
}
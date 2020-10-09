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
    fieldSize: number;
    opponentType: OpponentType;
    playersCount: number;
    gameType: GameType;
    figureType: FigureType;
}
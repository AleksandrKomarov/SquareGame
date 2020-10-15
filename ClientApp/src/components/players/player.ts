import * as React from 'react';
import { Coordinates } from '../coordinates';
import { IFigureGenerator } from '../figureGenerator/figureGenerator';

export interface IPlayer {
    getPlayerName(): string;
    getTurnMessage(): string;
    onMouseMove(coordinates: Coordinates): void;
    onMouseClick(coordinates: Coordinates): void;
    getCellClass(coordinates: Coordinates): string | null;
}

export interface PlayerProps {
    isActive: boolean;
    fieldSize: number;
    playerNumber: number;
    playersCells: Coordinates[][];
    figureGenerator: IFigureGenerator;

    updateField: () => void;
    onPlaceFigure: (coordinates: Coordinates[]) => void;
    onSkip: () => void;
    onGameEnd: (message: string) => void;
}

export abstract class Player<TProps extends PlayerProps, TState>  extends React.Component<TProps, TState> implements IPlayer  {
    abstract getPlayerName(): string;

    abstract getTurnMessage(): string;

    abstract render(): JSX.Element;

    abstract onMouseMove(coordinates: Coordinates): void;

    abstract onMouseClick(coordinates: Coordinates): void;

    abstract getCellClass(coordinates: Coordinates): string | null;

    protected couldPlaceFigure = (figureCoordinates: Coordinates[]): boolean => {
        const fieldSize = this.props.fieldSize;
        const playerNumber = this.props.playerNumber;

        if (figureCoordinates.some(c => c.row >= fieldSize || c.column >= fieldSize))
            return false;

        if (figureCoordinates.some(c => this.props.playersCells.some(cells => cells.some(a => a.row === c.row && a.column === c.column))))
            return false;

        let playerCells = this.props.playersCells[playerNumber];
        if (playerCells.length === 0) {
            playerCells = [];
            if (playerNumber === 0)
                playerCells.push({ row: -1, column: 0 });
            else if (playerNumber === 1)
                playerCells.push({ row: fieldSize, column: fieldSize - 1 });
            else if (playerNumber === 2)
                playerCells.push({ row: fieldSize, column: 0 });
            else
                playerCells.push({ row: -1, column: fieldSize - 1 });
        }

        return this.isNeighbor(figureCoordinates, playerCells);
    }

    private isNeighbor = (figureCoordinates: Coordinates[], neighbors: Coordinates[]): boolean => {
        return figureCoordinates.some(c => neighbors.some(n =>
            (n.row - 1 === c.row && n.column === c.column) ||
            (n.row + 1 === c.row && n.column === c.column) ||
            (n.row === c.row && n.column - 1 === c.column) ||
            (n.row === c.row && n.column + 1 === c.column)));
    };
}
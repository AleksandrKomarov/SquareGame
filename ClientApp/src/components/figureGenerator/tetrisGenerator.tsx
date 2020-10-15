import * as React from 'react';
import { IFigureGenerator } from './figureGenerator';
import { Figure } from "../figure";
import { Coordinates } from '../coordinates';
import Tetris from './tetris';

export default class TetrisGenerator implements IFigureGenerator {
    getDefault(): Figure {
        return {
            key: 0,
            canBeRotated: false,
            presenter: <Tetris figure={[]} />,
            coordinates: [],
            rotate: c => c
        };
    }

    generate(): Figure {
        const value = Math.floor(Math.random() * Math.floor(7));

        return this.restoreRemote(value);
    }

    restoreRemote(key: number): Figure {
        let figure: Coordinates[];
        let canBeRotated = true;
        switch (key) {
        case 0:
            figure = this.getSquare();
            canBeRotated = false;
            break;
        case 1:
            figure = this.getLine();
            break;
        case 2:
            figure = this.getT();
            break;
        case 3:
            figure = this.getG();
            break;
        case 4:
            figure = this.getBackG();
            break;
        case 5:
            figure = this.getZ();
            break;
        default:
            figure = this.getBackZ();
            break;
        }

        return {
            key: key,
            canBeRotated: canBeRotated,
            presenter: <Tetris figure={figure} />,
            coordinates: figure,
            rotate: this.rotate
        };
    }

    private getSquare = (): Coordinates[] => {
        return [{ row: 0, column: 0 }, { row: 0, column: 1 }, { row: 1, column: 0 }, { row: 1, column: 1 }];
    }

    private getLine = (): Coordinates[] => {
        return [{ row: 0, column: 0 }, { row: 0, column: 1 }, { row: 0, column: 2 }, { row: 0, column: 3 }];
    }

    private getT = (): Coordinates[] => {
        return [{ row: 0, column: 0 }, { row: 0, column: 1 }, { row: 0, column: 2 }, { row: 1, column: 1 }];
    }

    private getG = (): Coordinates[] => {
        return [{ row: 0, column: 0 }, { row: 0, column: 1 }, { row: 0, column: 2 }, { row: 1, column: 2 }];
    }

    private getBackG = (): Coordinates[] => {
        return [{ row: 0, column: 0 }, { row: 0, column: 1 }, { row: 0, column: 2 }, { row: 1, column: 0 }];
    }

    private getZ = (): Coordinates[] => {
        return [{ row: 0, column: 0 }, { row: 0, column: 1 }, { row: 1, column: 1 }, { row: 1, column: 2 }];
    }

    private getBackZ = (): Coordinates[] => {
        return [{ row: 1, column: 0 }, { row: 1, column: 1 }, { row: 0, column: 1 }, { row: 0, column: 2 }];
    }

    private rotate = (coordinates: Coordinates[]): Coordinates[] => {
        const res: Coordinates[] = [];
        for (let i = 0; i < coordinates.length; ++i) {
            if (i === 0) {
                res.push(coordinates[i]);
                continue;
            }

            const rowShift = coordinates[i].row - coordinates[i - 1].row;
            const columnShift = coordinates[i].column - coordinates[i - 1].column;
            res.push({row: res[i-1].row + columnShift, column: res[i-1].column - rowShift});
        }

        const minRow = res.map(c => c.row).reduce((p, c) => p > c ? c : p, 100);
        const minColumn = res.map(c => c.column).reduce((p, c) => p > c ? c : p, 100);

        return res.map(c => ({row: c.row - minRow, column: c.column - minColumn}));
    }
}
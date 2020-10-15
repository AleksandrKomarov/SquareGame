import * as React from 'react';
import { IFigureGenerator } from './figureGenerator';
import { Figure } from "../figure";
import { Coordinates } from '../coordinates';
import Dice from './dice';

export default class DiceGenerator implements IFigureGenerator {
    getDefault(): Figure {
        return {
            key: 0,
            canBeRotated: false,
            presenter: this.renderDice(1, 1),
            coordinates: [],
            rotate: c => c
        };
    }

    generate(): Figure {
        const firstDice = 1 + Math.floor(Math.random() * Math.floor(6));
        const secondDice = 1 + Math.floor(Math.random() * Math.floor(6));

        return this.restoreRemote(firstDice * 100 + secondDice);
    }

    restoreRemote(key: number): Figure {
        const firstDice = Math.floor(key / 100);
        const secondDice = key % 100;

        return {
            key: key,
            canBeRotated: firstDice !== secondDice,
            presenter: this.renderDice(firstDice, secondDice),
            coordinates: this.getCoordinates(firstDice, secondDice),
            rotate: this.rotate
        };
    }

    private renderDice = (firstDice: number, secondDice: number) => {
        return <div><Dice value={firstDice}/><Dice value={secondDice}/></div>;
    }

    private getCoordinates = (firstDice: number, secondDice: number): Coordinates[] => {
        const coordinates: Coordinates[] = [];

        for (let row = 0; row < firstDice; ++row) {
            for (let col = 0; col < secondDice; ++col) {
                coordinates.push({
                    row: row,
                    column: col
                });
            }
        }

        return coordinates;
    }

    private rotate = (coordinates: Coordinates[]): Coordinates[] => {
        return coordinates.map(c => ({ row: c.column, column: c.row }));
    }
}
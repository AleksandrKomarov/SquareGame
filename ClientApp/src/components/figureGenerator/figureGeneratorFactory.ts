import { FigureType } from '../gameParameters';
import { IFigureGenerator } from './figureGenerator';
import DiceGenerator from './diceGenerator';
import TetrisGenerator from './tetrisGenerator';

export default function createFigureGenerator(figureType: FigureType): IFigureGenerator {
    switch (figureType) {
        case FigureType.Dice:
            return new DiceGenerator();
        case FigureType.Tetris:
            return new TetrisGenerator();
        default:
            throw new Error("Not implemented");
    }
}
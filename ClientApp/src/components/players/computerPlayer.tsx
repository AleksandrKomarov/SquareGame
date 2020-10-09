import * as React from 'react';
import { PlayerProps, Player } from './player';
import { Coordinates } from '../coordinates';
import { Figure } from '../figure';
import ComputerTable from './computerTable';

interface State {
    figure: Figure;
    message: string;
    dig: string;
}

export default class ComputerPlayer extends Player<State> {
    constructor(props: PlayerProps) {
        super(props);

        this.state = {
            figure: props.figureGenerator.getDefault(),
            message: "Welcome!",
            dig: ""
        };
    }

    componentDidUpdate(prevProps: PlayerProps) {
        if (this.props.isActive !== prevProps.isActive && this.props.isActive) {
            this.setState({
                ...this.state,
                message: "Rolling..."
            }, () => this.rollDice());
        }
    }

    getPlayerName() {
        return this.props.playersCells.length === 2
            ? "Computer"
            : `Computer ${this.props.playerNumber}`;
    }

    getTurnMessage(): string {
        return "Computer is thinking...";
    }

    render(): JSX.Element {
        return (
            <ComputerTable
                playerNumber={this.props.playerNumber}
                computerName={this.getPlayerName()}
                points={this.props.playersCells[this.props.playerNumber].length}
                figurePresenter={this.state.figure.presenter}
                message={this.state.message}
                dig={this.state.dig} />);
    }

    onMouseMove(coordinates: Coordinates) {
        // empty
    }

    onMouseClick(coordinates: Coordinates) {
        // empty
    }

    getCellClass(coordinates: Coordinates) {
        return null;
    }

    private rollDice = () => {
        this.setState({
            ...this.state,
            figure: this.props.figureGenerator.generate(),
            message: "Thinking..."
        }, () => this.tryPlaceFigure());
    }

    private tryPlaceFigure = () => {
        const initialCoordinates = this.state.figure.coordinates;
        let coordinates = this.state.figure.coordinates;

        do {
            for (let i = 0; i < this.props.fieldSize; ++i) {
                for (let j = 0; j < this.props.fieldSize; ++j) {
                    const figure = coordinates.map(c => ({ row: c.row + i, column: c.column + j }));
                    if (this.couldPlaceFigure(figure)) {
                        this.setState({
                            ...this.state,
                            message: "Placed",
                            dig: this.getDig()
                        }, () => this.props.onPlaceFigure(figure));
                        return;
                    }
                }
            }

            if (this.state.figure.canBeRotated) {
                coordinates = this.state.figure.rotate(coordinates);
            }
        } while (!this.areEquals(initialCoordinates, coordinates))

        this.setState({
            ...this.state,
            message: "Skipped",
            dig: ""
        }, () => this.props.onSkip());
    }

    private areEquals = (f: Coordinates[], s: Coordinates[]): boolean => {
        if (f === s)
            return true;
        if (f.length !== s.length)
            return false;

        for (let i = 0; i < f.length; ++i) {
            if (f[i].row !== s[i].row || f[i].column !== s[i].column)
                return false;
        }

        return true;
    }

    private getDig = () => {
        const shouldMakeADig = Math.floor(Math.random() * Math.floor(5)) === 0;
        if (!shouldMakeADig)
            return "";

        const digNumber = Math.floor(Math.random() * Math.floor(6));
        switch (digNumber) {
            case 0:
                return "I asked hard level, not the easiest one!";
            case 1:
                return "Shitty result... I re-rolled, okay?";
            case 2:
                return "Hey, children should be supervised!";
            case 3:
                return "Previously I played with a monkey and that game was more challenging.";
            case 4:
                return "Watch and learn, puppy!";
            default:
                return "What a move! I have to record it as \"The stupidest move I've ever seen\"!";
        }
    }
}

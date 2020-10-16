import * as React from 'react';
import { PlayerProps, Player } from './player';
import { Coordinates } from '../coordinates';
import PlayerTable from './playerTable';
import { Figure } from '../figure';

export interface Props extends PlayerProps {
    isUser: boolean;
}

interface State {
    figure: Figure;
    figureCoordinates: Coordinates[];
    mousePosition: Coordinates | null;
    isPossibleMousePosition: boolean;
}

export class HumanPlayer extends Player<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            figure: props.figureGenerator.getDefault(),
            figureCoordinates: [],
            mousePosition: null,
            isPossibleMousePosition: false
        };
    }

    isUser() {
        return this.props.isUser;
    }

    getPlayerName() {
        switch (this.props.playerNumber) {
            case 0:
                return "Player A";
            case 1:
                return "Player B";
            case 2:
                return "Player C";
            default:
                return "Player D";
        }
    }

    getTurnMessage(): string {
        return this.props.playersCells[this.props.playerNumber].length === 0
            ? this.getFirstTurnMessage()
            : this.getNextTurnMessage();
    }

    private getFirstTurnMessage = () => {
        switch (this.props.playerNumber) {
            case 0:
                return `${this.getPlayerName()} first turn. Place a figure at left upper corner.`;
            case 1:
                return `${this.getPlayerName()} first turn. Place a figure at right lower corner.`;
            case 2:
                return `${this.getPlayerName()} first turn. Place a figure at left lower corner.`;
            default:
                return `${this.getPlayerName()} first turn. Place a figure at right upper corner.`;
        }
    }

    private getNextTurnMessage = () => {
        switch (this.props.playerNumber) {
            case 0:
                return `${this.getPlayerName()} turn. Place a figure close to blue squares.`;
            case 1:
                return `${this.getPlayerName()} turn. Place a figure close to green squares.`;
            case 2:
                return `${this.getPlayerName()} turn. Place a figure close to yellow squares.`;
            default:
                return `${this.getPlayerName()} turn. Place a figure close to violet squares.`;
        }
    }

    render() {
        return (
            <PlayerTable
                playerNumber={this.props.playerNumber}
                playerName={this.getPlayerName()}
                points={this.props.playersCells[this.props.playerNumber].length}
                figurePresenter={this.state.figure.presenter}
                isDisabled={!this.props.isActive}
                isRolled={this.state.figureCoordinates.length !== 0}
                canBeRotated={this.state.figure.canBeRotated}
                onRoll={this.onRoll}
                onRotate={this.onRotate}
                onSkip={this.onSkip} />);
    }

    private onRoll = () => {
        const figure = this.props.figureGenerator.generate();

        this.setState({
            ...this.state,
            figure: figure,
            figureCoordinates: figure.coordinates
        });
    }

    private onRotate = () => {
        this.setState({
            ...this.state,
            figureCoordinates: this.state.figure.rotate(this.state.figureCoordinates)
        }, this.props.updateField);
    }

    private onSkip = () => {
        this.setState({
            ...this.state,
            figureCoordinates: []
        }, this.props.onSkip);
    }

    onMouseMove(coordinates: Coordinates) {
        this.setState({
            ...this.state,
            mousePosition: coordinates,
            isPossibleMousePosition: this.couldPlaceFigure(this.getPotentialPosition(coordinates))
        }, this.props.updateField);
    }

    onMouseClick(coordinates: Coordinates) {
        const potentialPosition = this.getPotentialPosition(coordinates);

        if (this.couldPlaceFigure(potentialPosition))
            this.setState({
                ...this.state,
                figureCoordinates: []
            }, () => this.props.onPlaceFigure(potentialPosition));
    }

    getCellClass(coordinates: Coordinates) {
        const mousePosition = this.state.mousePosition;
        if (mousePosition == null)
            return null;

        const potentialPosition = this.getPotentialPosition(mousePosition);

        if (potentialPosition.some(c => c.row === coordinates.row && c.column === coordinates.column)) {
            return this.state.isPossibleMousePosition ? "possibleGoodPosition" : "possibleBadPosition";
        };

        return null;
    }

    private getPotentialPosition = (coordinates: Coordinates) => {
        return this.state.figureCoordinates.map(c => ({
            row: c.row + coordinates.row,
            column: c.column + coordinates.column
        }));
    }
}
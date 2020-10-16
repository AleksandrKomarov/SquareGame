import * as React from 'react';
import { PlayerProps, Player } from './player';
import { Coordinates } from '../coordinates';
import PlayerTable from './playerTable';
import ComputerTable from './computerTable';
import { Figure } from '../figure';
import { RemoteGame, IRemoteGameListener, RemoteGameStatus, Message, MessageType } from '../remoteGame';

export interface Props extends PlayerProps {
    isUser: boolean;
    remoteGame: RemoteGame;
}

interface State {
    message: string;
    dig: string;
    figure: Figure;
    figureCoordinates: Coordinates[];
    mousePosition: Coordinates | null;
    isPossibleMousePosition: boolean;
}

interface RollMessage {
    playerNumber: number;
    figureKey: number;
}

interface RotateMessage {
    playerNumber: number;
}

interface SkipMessage {
    playerNumber: number;
}

interface PlaceMessage {
    playerNumber: number;
    position: Coordinates[];
}

interface MouseMoveMessage {
    playerNumber: number;
    position: Coordinates;
}

interface TextMessage {
    playerNumber: number;
    text: string;
}

export class RemotePlayer extends Player<Props, State> implements IRemoteGameListener {
    constructor(props: Props) {
        super(props);

        this.props.remoteGame.addListener(this);

        this.state = {
            figure: props.figureGenerator.getDefault(),
            figureCoordinates: [],
            mousePosition: null,
            isPossibleMousePosition: false,
            message: "Waiting for turn",
            dig: ""
        };
    }

    componentWillUnmount() {
        this.props.remoteGame.removeListener(this);
        this.props.remoteGame.disconnect();
    }

    onStatusChange = (status: RemoteGameStatus): void => {
        if (status === RemoteGameStatus.Ended) {
            this.props.onGameEnd("Remote game has suddenly ended");
        }
    }

    onMessage = (message: Message): void => {
        switch (message.type) {
            case MessageType.PlayersChanged:
                this.props.onGameEnd("Player disconnected");
                break;
            case MessageType.Roll:
                const rollData: RollMessage = message.data;
                if (rollData.playerNumber === this.props.playerNumber) {
                    const figure = this.props.figureGenerator.restoreRemote(rollData.figureKey);

                    this.setState({
                        ...this.state,
                        figure: figure,
                        figureCoordinates: figure.coordinates,
                        message: "Rolled"
                    });
                }
                break;
            case MessageType.Rotate:
                const rotateData: SkipMessage = message.data;
                if (rotateData.playerNumber === this.props.playerNumber) {
                    this.setState({
                        ...this.state,
                        figureCoordinates: this.state.figure.rotate(this.state.figureCoordinates),
                        message: "Rotated"
                    });
                }
                break;
            case MessageType.Skip:
                const skipData: SkipMessage = message.data;
                if (skipData.playerNumber === this.props.playerNumber) {
                    this.setState({
                        ...this.state,
                        figureCoordinates: [],
                        message: "Skipped"
                    }, () => this.props.onSkip());
                }
                break;
            case MessageType.Place:
                const placeData: PlaceMessage = message.data;
                if (placeData.playerNumber === this.props.playerNumber) {
                    this.setState({
                        ...this.state,
                        figureCoordinates: [],
                        message: "Placed"
                    }, () => this.props.onPlaceFigure(placeData.position));
                }
                break;
            case MessageType.MouseMove:
                const mouseMoveData: MouseMoveMessage = message.data;
                if (mouseMoveData.playerNumber === this.props.playerNumber) {
                    const message = this.state.figureCoordinates.length > 0
                        ? "Trying to find a nice place"
                        : this.state.message;
                    this.setState({
                        ...this.state,
                        mousePosition: mouseMoveData.position,
                        message: message
                    }, this.props.updateField);
                }
                break;
            case MessageType.Message:
                const textMessage: TextMessage = message.data;
                if (textMessage.playerNumber === this.props.playerNumber) {
                    this.setState({
                        ...this.state,
                        dig: textMessage.text
                    }, this.props.updateField);
                }
                break;
        }
    }

    isUser() {
        return this.props.isUser;
    }

    getPlayerName() {
        const nickname = this.props.remoteGame.tryGetPlayerNickname(this.props.playerNumber);
        if (nickname !== null)
            return nickname;

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
        if (!this.props.isActive)
            return `${this.getPlayerName()} turn`;

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
        return this.props.isUser ? this.renderUserTable() : this.renderRemotePlayerTable();
    }

    private renderUserTable = () => {
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
                onSkip={this.onSkip}
                showSendMessage={true}
                onSendMessage={this.sendTextMessage}/>);
    }

    private sendTextMessage = (text: string) => {
        const data: TextMessage = {
            playerNumber: this.props.playerNumber,
            text: text
        };
        this.props.remoteGame.send({
            type: MessageType.Message,
            data: data
        });
    }

    private renderRemotePlayerTable = () => {
        return (
            <ComputerTable
                playerNumber={this.props.playerNumber}
                computerName={this.getPlayerName()}
                points={this.props.playersCells[this.props.playerNumber].length}
                figurePresenter={this.state.figure.presenter}
                message={this.state.message}
                dig={<div>{this.state.dig}</div>} />);
    }

    private onRoll = () => {
        const figure = this.props.figureGenerator.generate();

        this.setState({
            ...this.state,
            figure: figure,
            figureCoordinates: figure.coordinates
        }, () => {
            const data: RollMessage = {
                playerNumber: this.props.playerNumber,
                figureKey: figure.key
            };
            this.props.remoteGame.send({
                type: MessageType.Roll,
                data: data
            });
        });
    }

    private onRotate = () => {
        this.setState({
            ...this.state,
            figureCoordinates: this.state.figure.rotate(this.state.figureCoordinates)
        }, () => {
            this.props.updateField();
            const data: RotateMessage = {
                playerNumber: this.props.playerNumber
            };
            this.props.remoteGame.send({
                type: MessageType.Rotate,
                data: data
            });
        });
    }

    private onSkip = () => {
        this.setState({
            ...this.state,
            figureCoordinates: []
        }, () => {
            this.props.onSkip();
            const data: SkipMessage = {
                playerNumber: this.props.playerNumber
            };
            this.props.remoteGame.send({
                type: MessageType.Skip,
                data: data
            });
        });
    }

    onMouseMove(coordinates: Coordinates) {
        if (!this.props.isActive)
            return;

        const mousePosition = this.state.mousePosition;
        if (mousePosition !== null) {
            if (mousePosition.row === coordinates.row && mousePosition.column === coordinates.column) {
                return;
            }
        }

        this.setState({
            ...this.state,
            mousePosition: coordinates,
            isPossibleMousePosition: this.couldPlaceFigure(this.getPotentialPosition(coordinates))
        }, () => {
            this.props.updateField();
            const data: MouseMoveMessage = {
                playerNumber: this.props.playerNumber,
                position: coordinates
            };
            this.props.remoteGame.send({
                type: MessageType.MouseMove,
                data: data
            });
        });
    }

    onMouseClick(coordinates: Coordinates) {
        if (!this.props.isActive)
            return;

        const potentialPosition = this.getPotentialPosition(coordinates);

        if (this.couldPlaceFigure(potentialPosition))
            this.setState({
                ...this.state,
                figureCoordinates: []
            }, () => {
                this.props.onPlaceFigure(potentialPosition);
                const data: PlaceMessage = {
                    playerNumber: this.props.playerNumber,
                    position: potentialPosition
                };
                this.props.remoteGame.send({
                    type: MessageType.Place,
                    data: data
                });
            });
    }

    getCellClass(coordinates: Coordinates) {
        const mousePosition = this.state.mousePosition;
        if (mousePosition == null)
            return null;

        const potentialPosition = this.getPotentialPosition(mousePosition);

        if (potentialPosition.some(c => c.row === coordinates.row && c.column === coordinates.column)) {
            return this.props.isActive
                ? this.state.isPossibleMousePosition ? "possibleGoodPosition" : "possibleBadPosition"
                : "possibleRemotePosition";
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
import * as React from 'react';
import { OpponentType, GameType, FigureType, GameParameters } from './gameParameters';

interface Props {
    previousParameters: GameParameters;
    onCreateNewGame: (gameParameters: GameParameters) => void;
}

export default class GameParametersComponent extends React.Component<Props, GameParameters> {
    constructor(props: Props) {
        super(props);

        this.state = {
            ...props.previousParameters
        };
    }

    render() {
        return (
            <div>
                {this.renderFieldSizeSelector()}
                {this.renderFigureSelector()}
                {this.renderOpponentTypeSelector()}
                {this.renderPlayersCountSelector()}
                {this.renderGameTypeSelector()}
                <button className="startGame" onClick={() => this.props.onCreateNewGame(this.state)}>Start</button>
            </div>);
    }

    private renderFieldSizeSelector = () => {
        return (
            <div>
                <div>Select field size</div>
                <button className={this.state.fieldSize === 10 ? "gameParameters selected" : "gameParameters"} onClick={() => this.onFieldSizeButtonClick(10)}>Small</button>
                <button className={this.state.fieldSize === 15 ? "gameParameters selected" : "gameParameters"} onClick={() => this.onFieldSizeButtonClick(15)}>Medium</button>
                <button className={this.state.fieldSize === 20 ? "gameParameters selected" : "gameParameters"} onClick={() => this.onFieldSizeButtonClick(20)}>Big</button>
                <button className={this.state.fieldSize === 30 ? "gameParameters selected" : "gameParameters"} onClick={() => this.onFieldSizeButtonClick(30)}>Giant</button>
            </div>);
    }

    private onFieldSizeButtonClick = (size: number) => {
        this.setState({
            ...this.state,
            fieldSize: size
        });
    }

    private renderFigureSelector = () => {
        return (
            <div>
                <div>Select figure</div>
                <button className={this.state.figureType === FigureType.Dice ? "gameParameters selected" : "gameParameters"} onClick={() => this.onFigureButtonClick(FigureType.Dice)}>Dice</button>
                <button className={this.state.figureType === FigureType.Tetris ? "gameParameters selected" : "gameParameters"} onClick={() => this.onFigureButtonClick(FigureType.Tetris)}>Tetris</button>
            </div>);
    }

    private onFigureButtonClick = (figure: FigureType) => {
        this.setState({
            ...this.state,
            figureType: figure
        });
    }

    private renderOpponentTypeSelector = () => {
        return (
            <div>
                <div>Select opponent</div>
                <button className={this.state.opponentType === OpponentType.Human ? "gameParameters selected" : "gameParameters"} onClick={() => this.onOpponentTypeButtonClick(OpponentType.Human)}>Human</button>
                <button className={this.state.opponentType === OpponentType.Computer ? "gameParameters selected" : "gameParameters"} onClick={() => this.onOpponentTypeButtonClick(OpponentType.Computer)}>Computer</button>
            </div>);
    }

    private onOpponentTypeButtonClick = (opponentType: OpponentType) => {
        this.setState({
            ...this.state,
            opponentType: opponentType,
            gameType: GameType.Pvp
        });
    }

    private renderPlayersCountSelector = () => {
        return (
            <div>
                <div>Select players count</div>
                <button className={this.state.playersCount === 2 ? "gameParameters selected" : "gameParameters"} onClick={() => this.onPlayersCountButtonClick(2)}>2</button>
                <button className={this.state.playersCount === 3 ? "gameParameters selected" : "gameParameters"} onClick={() => this.onPlayersCountButtonClick(3)}>3</button>
                <button className={this.state.playersCount === 4 ? "gameParameters selected" : "gameParameters"} onClick={() => this.onPlayersCountButtonClick(4)}>4</button>
            </div>);
    }

    private onPlayersCountButtonClick = (count: number) => {
        this.setState({
            ...this.state,
            playersCount: count
        });
    }

    private renderGameTypeSelector = () => {
        if (this.state.opponentType !== OpponentType.Human)
            return null;

        return (
            <div>
                <div>Select game type</div>
                <button className={this.state.gameType === GameType.Pvp ? "gameParameters selected" : "gameParameters"} onClick={() => this.onGameTypeButtonClick(GameType.Pvp)}>PvP</button>
                <button className={this.state.gameType === GameType.Pve ? "gameParameters selected" : "gameParameters"} onClick={() => this.onGameTypeButtonClick(GameType.Pve)}>PvE</button>
            </div>);
    }

    private onGameTypeButtonClick = (gameType: GameType) => {
        this.setState({
            ...this.state,
            gameType: gameType
        });
    }
}

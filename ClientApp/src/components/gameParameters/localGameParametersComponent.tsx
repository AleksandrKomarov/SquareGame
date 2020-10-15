import * as React from 'react';
import { GameParametersProps } from './gameParametersProps';
import { ServerType, OpponentType, GameType, FigureType, GameParameters } from './gameParameters';
import BasicGameParametersComponent from './basicGameParametersComponent';

export default class LocalGameParametersComponent extends React.Component<GameParametersProps, GameParameters> {
    constructor(props: GameParametersProps) {
        super(props);

        this.state = {
            ...props.previousGameParameters,
            serverType: ServerType.Local
        };
    }

    render() {
        return (
            <div>
                <BasicGameParametersComponent
                    gameParameters={this.state}
                    onFieldSizeChange={this.onFieldSizeChange}
                    onFigureTypeChange={this.onFigureTypeChange}
                    onGameTypeChange={this.onGameTypeChange} />
                {this.renderOpponentTypeSelector()}
                {this.renderPlayersCountSelector()}
                <button className="startGame" onClick={() => this.props.onCreateNewGame(this.state)}>Start</button>
            </div>);
    }

    private onFieldSizeChange = (fieldSize: number) => {
        this.setState({
            ...this.state,
            fieldSize: fieldSize
        });
    }

    private onFigureTypeChange = (figureType: FigureType) => {
        this.setState({
            ...this.state,
            figureType: figureType
        });
    }

    private onGameTypeChange = (gameType: GameType) => {
        const opponentType = gameType === GameType.Pve ? OpponentType.Human : this.state.opponentType;
        const playersCount = gameType === GameType.Pvp && this.state.playersCount === 1 ? 2 : this.state.playersCount;

        this.setState({
            ...this.state,
            gameType: gameType,
            opponentType: opponentType,
            playersCount: playersCount
        });
    }

    private renderOpponentTypeSelector = () => {
        const shouldComputerBeDisabled = this.state.gameType !== GameType.Pvp;

        return (
            <div>
                <div>Select opponent</div>
                <button
                    disabled={shouldComputerBeDisabled}
                    className={this.state.opponentType === OpponentType.Computer ? "gameParameters selected" : "gameParameters"}
                    onClick={() => {
                        if (shouldComputerBeDisabled)
                            return;
                        this.onOpponentTypeChange(OpponentType.Computer);
                    }}>
                    Computer
                </button>
                <button className={this.state.opponentType === OpponentType.Human ? "gameParameters selected" : "gameParameters"} onClick={() => this.onOpponentTypeChange(OpponentType.Human)}>Human</button>
            </div>);
    }

    private onOpponentTypeChange = (opponentType: OpponentType) => {
        this.setState({
            ...this.state,
            opponentType: opponentType
        });
    }

    private renderPlayersCountSelector = () => {
        const shouldSingleBeDisabled = this.state.gameType !== GameType.Pve;

        return (
            <div>
                <div>Select players count</div>
                <button
                    disabled={shouldSingleBeDisabled}
                    className={this.state.playersCount === 1 ? "gameParameters selected" : "gameParameters"}
                    onClick={() => {
                        if (shouldSingleBeDisabled)
                            return;
                        this.onPlayersCountChange(1);
                    }}>
                    1
                </button>
                <button className={this.state.playersCount === 2 ? "gameParameters selected" : "gameParameters"} onClick={() => this.onPlayersCountChange(2)}>2</button>
                <button className={this.state.playersCount === 3 ? "gameParameters selected" : "gameParameters"} onClick={() => this.onPlayersCountChange(3)}>3</button>
                <button className={this.state.playersCount === 4 ? "gameParameters selected" : "gameParameters"} onClick={() => this.onPlayersCountChange(4)}>4</button>
            </div>);
    }

    private onPlayersCountChange = (count: number) => {
        this.setState({
            ...this.state,
            playersCount: count
        });
    }
}

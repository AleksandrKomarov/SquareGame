import * as React from 'react';
import { GameType, FigureType, GameParameters } from './gameParameters';

interface Props {
    gameParameters: GameParameters;
    onFieldSizeChange: (fieldSize: number) => void;
    onFigureTypeChange: (figureType: FigureType) => void;
    onGameTypeChange: (gameType: GameType) => void;
}

export default class BasicGameParametersComponent extends React.Component<Props> {
    render() {
        return (
            <div>
                {this.renderFieldSizeSelector()}
                {this.renderFigureSelector()}
                {this.renderGameTypeSelector()}
            </div>);
    }

    private renderFieldSizeSelector = () => {
        return (
            <div>
                <div>Select field size</div>
                <button className={this.props.gameParameters.fieldSize === 10 ? "gameParameters selected" : "gameParameters"} onClick={() => this.props.onFieldSizeChange(10)}>Small</button>
                <button className={this.props.gameParameters.fieldSize === 15 ? "gameParameters selected" : "gameParameters"} onClick={() => this.props.onFieldSizeChange(15)}>Medium</button>
                <button className={this.props.gameParameters.fieldSize === 20 ? "gameParameters selected" : "gameParameters"} onClick={() => this.props.onFieldSizeChange(20)}>Big</button>
                <button className={this.props.gameParameters.fieldSize === 30 ? "gameParameters selected" : "gameParameters"} onClick={() => this.props.onFieldSizeChange(30)}>Giant</button>
            </div>);
    }

    private renderFigureSelector = () => {
        return (
            <div>
                <div>Select figure</div>
                <button className={this.props.gameParameters.figureType === FigureType.Dice ? "gameParameters selected" : "gameParameters"} onClick={() => this.props.onFigureTypeChange(FigureType.Dice)}>Dice</button>
                <button className={this.props.gameParameters.figureType === FigureType.Tetris ? "gameParameters selected" : "gameParameters"} onClick={() => this.props.onFigureTypeChange(FigureType.Tetris)}>Tetris</button>
            </div>);
    }

    private renderGameTypeSelector = () => {
        return (
            <div>
                <div>Select game type</div>
                <button className={this.props.gameParameters.gameType === GameType.Pvp ? "gameParameters selected" : "gameParameters"} onClick={() => this.props.onGameTypeChange(GameType.Pvp)}>PvP</button>
                <button className={this.props.gameParameters.gameType === GameType.Pve ? "gameParameters selected" : "gameParameters"} onClick={() => this.props.onGameTypeChange(GameType.Pve)}>PvE</button>
            </div>);
    }
}

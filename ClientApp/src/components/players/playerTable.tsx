import * as React from 'react';

interface Props {
    playerNumber: number;
    playerName: string;
    points: number;
    figurePresenter: JSX.Element;
    isDisabled: boolean;
    isRolled: boolean;
    canBeRotated: boolean;

    onRoll: () => void;
    onRotate: () => void;
    onSkip: () => void;
}

export default class PlayerTable extends React.Component<Props> {
    render() {
        return (
            <div className={`player player${this.props.playerNumber}`}>
                <h5>{this.props.playerName}</h5>
                <div>points: {this.props.points}</div>
                {this.props.figurePresenter}
                <div><button className="playerTable" disabled={this.props.isDisabled || this.props.isRolled} onClick={this.props.onRoll}>Roll!</button></div>
                <div><button className="playerTable" disabled={this.props.isDisabled || !this.props.isRolled || !this.props.canBeRotated} onClick={this.props.onRotate}>Rotate</button></div>
                <div><button className="playerTable" disabled={this.props.isDisabled } onClick={this.props.onSkip}>Skip</button></div>
            </div>);
    }
}
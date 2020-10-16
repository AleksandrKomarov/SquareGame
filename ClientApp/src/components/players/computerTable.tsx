import * as React from 'react';

interface Props {
    playerNumber: number;
    computerName: string;
    points: number;
    figurePresenter: JSX.Element;
    message: string;
    dig: JSX.Element;
}

export default class ComputerTable extends React.Component<Props> {
    render() {
        return (
            <div className={`player player${this.props.playerNumber}`}>
                <h5>{this.props.computerName}</h5>
                <div>points: {this.props.points}</div>
                {this.props.figurePresenter}
                <div>{this.props.message}</div>
                {this.props.dig}
            </div>);
    }
}
import * as React from 'react';
import Picker, { IEmojiData } from 'emoji-picker-react';

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

    showSendMessage?: boolean;
    onSendMessage?: (text: string) => void;
}

interface State {
    pickerIsOpen: boolean;
}

export default class PlayerTable extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            pickerIsOpen: false
        };
    }

    render() {
        return (
            <div className={`player player${this.props.playerNumber}`}>
                <h5>{this.props.playerName}</h5>
                <div>points: {this.props.points}</div>
                {this.props.figurePresenter}
                <div><button className="playerTable" disabled={this.props.isDisabled || this.props.isRolled} onClick={this.props.onRoll}>Roll!</button></div>
                <div><button className="playerTable" disabled={this.props.isDisabled || !this.props.isRolled || !this.props.canBeRotated} onClick={this.props.onRotate}>Rotate</button></div>
                <div><button className="playerTable" disabled={this.props.isDisabled} onClick={this.props.onSkip}>Skip</button></div>
                {this.renderMessageSending()}
            </div>);
    }

    private renderMessageSending = () => {
        const shouldShow = this.props.showSendMessage || false;
        if (!shouldShow) {
            return null;
        }

        if (this.state.pickerIsOpen) {
            return <Picker onEmojiClick={(_: MouseEvent, data: IEmojiData) => this.onEmojiClick(data.emoji)} />;
        } else {
            return <div><button className="playerTable" onClick={this.openPicker}>Send an emoji</button></div>;
        }
    }

    private openPicker = () => {
        this.setState({
            ...this.state,
            pickerIsOpen: true
        });
    }

    private onEmojiClick = (emoji: string) => {
        const callback = this.props.onSendMessage || ((_: string) => { });

        this.setState({
            ...this.state,
            pickerIsOpen: false
        }, () => callback(emoji));
    }
}
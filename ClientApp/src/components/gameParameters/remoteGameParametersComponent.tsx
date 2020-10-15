import * as React from 'react';
import { GameParametersProps } from './gameParametersProps';
import { ServerType, GameParameters } from './gameParameters';
import { IRemoteGameListener, RemoteGameStatus, RemoteGame, Message, MessageType} from '../remoteGame';

interface State {
    remoteGame: RemoteGame | null;
    gameGuid: string;
    errorMessage: string | null;
}

export default class RemoteGameParametersComponent extends React.Component<GameParametersProps, State> implements IRemoteGameListener {
    constructor(props: GameParametersProps) {
        super(props);

        this.state = {
            remoteGame: null,
            gameGuid: "",
            errorMessage: null
        };
    }

    componentWillUnmount() {
        const remoteGame = this.state.remoteGame;
        if (remoteGame !== null) {
            remoteGame.removeListener(this);
            remoteGame.disconnect();
        }
    }

    render() {
        const remoteGame = this.state.remoteGame;
        if (remoteGame === null) {
            return (
                <div>
                    <input style={{"width": "310px"}} placeholder="Enter game guid" value={this.state.gameGuid} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.onGameGuidChange(event.target.value)} />
                    <button className="gameParameters" onClick={this.onConnectClick}>Connect</button>
                    <span className="error-message">{this.state.errorMessage}</span>
                </div>);
        }

        return (
            <div>
                <div>Game guid:</div>
                <div><strong>{remoteGame.getGameGuid()}</strong></div>
                <p>Connected players: {remoteGame.getPlayersCount()}</p>
                <button disabled={true} className="startGame">Waiting for host to start</button>
            </div>);
    }

    onStatusChange = (status: RemoteGameStatus): void => {
        switch (status) {
            case RemoteGameStatus.Ready:
                this.forceUpdate();
                break;
            case RemoteGameStatus.Ended:
                const remoteGame = this.state.remoteGame;
                if (remoteGame !== null) {
                    remoteGame.removeListener(this);
                    this.setState({
                        ...this.state,
                        remoteGame: null,
                        errorMessage: "Could not connect to remote game"
                    });
                }
                break;
        }
    }

    onMessage = (message: Message): void => {
        switch (message.type) {
            case MessageType.PlayersChanged:
                this.forceUpdate();
                break;
            case MessageType.GameStarted:
                const remoteGame = this.state.remoteGame;
                if (remoteGame === null) {
                    return;
                }

                remoteGame.removeListener(this);

                const gameParameters: GameParameters = message.data;

                this.setState({
                    ...this.state,
                    remoteGame: null
                }, () => this.props.onCreateNewGame({
                    ...gameParameters,
                    serverType: ServerType.Remote,
                    remoteGame: remoteGame,
                    playersCount: remoteGame.getPlayersCount()
                }));
                break;
        }
    }

    private onGameGuidChange = (gameGuid: string) => {
        this.setState({
            ...this.state,
            gameGuid: gameGuid,
            errorMessage: null
        });
    }

    private onConnectClick = () => {
        const gameGuid = this.state.gameGuid;
        if (gameGuid === null)
            return;

        const remoteGame = new RemoteGame(gameGuid);
        remoteGame.addListener(this);

        this.setState({
            ...this.state,
            remoteGame: remoteGame,
            errorMessage: null
        });
    }
}

import * as React from 'react';
import { GameParametersProps } from './gameParametersProps';
import { ServerType, GameParameters } from './gameParameters';
import { IRemoteGameListener, RemoteGameStatus, RemoteGame, Message, MessageType } from '../remoteGame';
import CookieManager from '../cookieManager';

interface PublicGame {
    gameGuid: string;
    name: string;
}

interface State {
    publicGames: PublicGame[];
    remoteGame: RemoteGame | null;
    gameGuid: string;
    errorMessage: string | null;
}

export default class RemoteGameParametersComponent extends React.Component<GameParametersProps, State> implements IRemoteGameListener {
    constructor(props: GameParametersProps) {
        super(props);

        this.state = {
            publicGames: [],
            remoteGame: null,
            gameGuid: "",
            errorMessage: null
        };
    }

    componentDidMount() {
        this.getPublicGames();
    }

    componentWillUnmount() {
        const remoteGame = this.state.remoteGame;
        if (remoteGame !== null) {
            remoteGame.removeListener(this);
            remoteGame.disconnect();
        }
    }

    private getPublicGames = async () => {
        const response = await fetch("/api/game/GetPublicGames", { method: "GET" });
        const publicGames = await response.json() as PublicGame[];
        this.setState({
            ...this.state,
            publicGames: publicGames
        });
    }

    render() {
        const remoteGame = this.state.remoteGame;
        if (remoteGame === null) {
            return (
                <div>
                    <div>Select public game:</div>
                    {this.renderPublicGameSelector()}
                    <div>Or enter private game guid:</div>
                    {this.renderPrivateGameConnector()}
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

    private renderPublicGameSelector = () => {
        let content: JSX.Element;

        if (this.state.publicGames.length === 0) {
            content = <div>No public games :(</div>;
        } else {
            const games = this.state.publicGames
                .map(pg => <li key={pg.gameGuid} onClick={() => this.connect(pg.gameGuid)}><span>{pg.name} ({pg.gameGuid})</span></li>);
            content = (
                <ul id="publicGames">
                    {games}
                </ul>);
        }

        return (
            <div>
                {content}
                <button className="gameParameters" onClick={this.getPublicGames}>Refresh</button>
            </div>);
    }

    private renderPrivateGameConnector = () => {
        return (
            <div>
                <input style={{ "width": "310px" }} placeholder="Enter game guid" value={this.state.gameGuid} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.onGameGuidChange(event.target.value)} />
                <button className="gameParameters" onClick={this.onConnectClick}>Connect</button>
                <span className="error-message">{this.state.errorMessage}</span>
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

                if (CookieManager.getInstance().getConsentToStoreNickname()) {
                    const nickname = CookieManager.getInstance().getNickname();
                    if (nickname !== null && nickname !== "") {
                        remoteGame.sendNickname(nickname);
                    }
                }

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
        if (gameGuid === "")
            return;

        this.connect(gameGuid);
    }

    private connect = (gameGuid: string) => {
        const remoteGame = new RemoteGame(gameGuid);
        remoteGame.addListener(this);

        this.setState({
            ...this.state,
            remoteGame: remoteGame,
            errorMessage: null
        });
    }
}

import * as React from 'react';
import { GameParametersProps } from './gameParametersProps';
import { ServerType, GameType, FigureType, GameParameters } from './gameParameters';
import { IRemoteGameListener, RemoteGameStatus, RemoteGame, Message, MessageType } from '../remoteGame';
import BasicGameParametersComponent from './basicGameParametersComponent';
import CookieManager from '../cookieManager';

interface State {
    gameParameters: GameParameters;
    remoteGame: RemoteGame | null;
    errorMessage: string | null;
    publicGame: boolean;
    publicGameName: string;
}

export default class HostGameParametersComponent extends React.Component<GameParametersProps, State> implements IRemoteGameListener {
    constructor(props: GameParametersProps) {
        super(props);

        this.state = {
            gameParameters: {
                ...props.previousGameParameters,
                serverType: ServerType.Host
            },
            remoteGame: null,
            errorMessage: null,
            publicGame: false,
            publicGameName: ""
        };
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
                        errorMessage: "Could not create a remote game, try again later"
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
        }
    }

    async componentWillUnmount() {
        const remoteGame = this.state.remoteGame;
        if (remoteGame !== null) {
            const gameGuid = remoteGame.getGameGuid();

            remoteGame.removeListener(this);
            remoteGame.disconnect();

            await fetch(`/api/game/End?gameGuid=${gameGuid}`, { method: "POST" });
        }
    }

    render() {
        return (
            <div>
                {this.renderCreateGameSection()}
                <BasicGameParametersComponent
                    gameParameters={this.state.gameParameters}
                    onFieldSizeChange={this.onFieldSizeChange}
                    onFigureTypeChange={this.onFigureTypeChange}
                    onGameTypeChange={this.onGameTypeChange} />
                {this.renderStartGameButton()}
            </div>);
    }

    private renderCreateGameSection = () => {
        const remoteGame = this.state.remoteGame;
        if (remoteGame === null) {
            return (
                <div>
                    {this.renderPublicGameCheckbox()}
                    {this.renderPublicGameNameField()}
                    {this.renderStartButton()}
                </div>);
        }

        switch (remoteGame.getStatus()) {
            case RemoteGameStatus.Connecting:
                return <p>Connecting...</p>;
            case RemoteGameStatus.Ready:
                return (
                    <div>
                        <div>Game guid:</div>
                        <div><strong>{remoteGame.getGameGuid()}</strong></div>
                        <p>Tell it to your friends</p>
                        <p>Connected players: {remoteGame.getPlayersCount()}</p>
                    </div>);
            default:
                return null;
        }
    }

    private renderPublicGameCheckbox = () => {
        return (
            <div>
                <input
                    type="checkbox"
                    checked={this.state.publicGame}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.onPublicGameChange(event.target.checked)} />
                <span>Public game: visible for everyone</span>
            </div>);
    }

    private onPublicGameChange = (publicGame: boolean) => {
        this.setState({
            ...this.state,
            publicGame: publicGame,
            publicGameName: ""
        });
    }

    private renderPublicGameNameField = () => {
        if (!this.state.publicGame)
            return null;

        return (
            <div>
                <input
                    style={{ "width": "300px" }}
                    placeholder="Enter game name"
                    value={this.state.publicGameName}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.onPublicGameNameChange(event.target.value)} />
            </div>);
    }

    private onPublicGameNameChange = (publicGameName: string) => {
        if (publicGameName.length > 20) {
            return;
        }

        this.setState({
            ...this.state,
            publicGameName: publicGameName
        });
    }

    private renderStartButton = () => {
        const isDisabled = this.state.publicGame && this.state.publicGameName === "";

        return (
            <div>
                <button
                    disabled={isDisabled}
                    className="gameParameters"
                    onClick={() => {
                        if (!isDisabled)
                            this.onStartNewGameClick();
                    }}>
                    Start new game
                </button>
                <span className="error-message">{this.state.errorMessage}</span>
            </div>);
    }

    private onStartNewGameClick = async () => {
        const response = await fetch(`/api/game/StartNew?gameName=${this.state.publicGameName}`, { method: "POST" });
        const gameGuid = await response.json() as string;

        const remoteGame = new RemoteGame(gameGuid);
        remoteGame.addListener(this);

        this.setState({
            ...this.state,
            remoteGame: remoteGame,
            errorMessage: null
        });
    }

    private onFieldSizeChange = (fieldSize: number) => {
        this.setState({
            ...this.state,
            gameParameters: {
                ...this.state.gameParameters,
                fieldSize: fieldSize
            }
        });
    }

    private onFigureTypeChange = (figureType: FigureType) => {
        this.setState({
            ...this.state,
            gameParameters: {
                ...this.state.gameParameters,
                figureType: figureType
            }
        });
    }

    private onGameTypeChange = (gameType: GameType) => {
        this.setState({
            ...this.state,
            gameParameters: {
                ...this.state.gameParameters,
                gameType: gameType
            }
        });
    }

    private renderStartGameButton = () => {
        const remoteGame = this.state.remoteGame;
        const playersCount = remoteGame === null ? 0 : remoteGame.getPlayersCount();

        if (playersCount > 1)
            return <button className="startGame" onClick={this.onCreateRemoteGame}>Start</button>;
        else
            return <button disabled={true} className="startGame">Start</button>;
    }

    private onCreateRemoteGame = () => {
        const remoteGame = this.state.remoteGame;
        if (remoteGame === null)
            return;

        remoteGame.removeListener(this);

        if (CookieManager.getInstance().getConsentToStoreNickname()) {
            const nickname = CookieManager.getInstance().getNickname();
            if (nickname !== null && nickname !== "") {
                remoteGame.sendNickname(nickname);
            }
        }

        const gameParameters: GameParameters = {
            ...this.state.gameParameters,
            playersCount: remoteGame.getPlayersCount(),
            remoteGame: remoteGame
        }

        remoteGame.send({
            type: MessageType.GameStarted,
            data: {
                ...gameParameters,
                remoteGame: null
            }
        });

        this.setState({
            ...this.state,
            remoteGame: null
        }, () => this.props.onCreateNewGame(gameParameters));
    }
}

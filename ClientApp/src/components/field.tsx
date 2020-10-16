import * as React from 'react';
import { getPlayersTables, getPlayers } from './players/playersFactory';
import { IPlayer } from "./players/player";
import { GameParameters } from "./gameParameters/gameParameters";
import { PlayerProps } from './players/player';
import { Coordinates } from './coordinates';
import createFigureGenerator from './figureGenerator/figureGeneratorFactory';
import { IGameTypeProvider, createGameTypeProvider } from './gameTypeProvider';
import CookieManager from './cookieManager';
import { StatisticElement } from './statisticElement';

interface Props {
    gameParameters: GameParameters;
}

interface State {
    playerCells: Coordinates[][];
    playerNumberTurn: number;

    skippedCount: number;
    gameEnd: boolean;
}

export default class Field extends React.Component<Props, State> {
    private players: IPlayer[] = [];
    private readonly defaultPlayerProps: PlayerProps;
    private readonly gameTypeProvider: IGameTypeProvider;

    constructor(props: Props) {
        super(props);

        this.defaultPlayerProps = {
            figureGenerator: createFigureGenerator(props.gameParameters.figureType),
            fieldSize: props.gameParameters.fieldSize,
            playersCells: [],
            playerNumber: 0,
            isActive: false,
            updateField: () => this.forceUpdate(),
            onPlaceFigure: this.placeFigure.bind(this),
            onSkip: this.onSkip.bind(this),
            onGameEnd: this.onGameEnd.bind(this)
        };

        this.gameTypeProvider = createGameTypeProvider(props.gameParameters);

        const playerCells: Coordinates[][] = [];
        for (let i = 0; i < props.gameParameters.playersCount; ++i) {
            playerCells.push([]);
        }

        this.state = {
            playerCells: playerCells,
            playerNumberTurn: 0,

            skippedCount: 0,
            gameEnd: false
        };
    }

    componentDidMount() {
        this.players = getPlayers();

        window.addEventListener('resize', () => this.forceUpdate());

        this.forceUpdate();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', () => this.forceUpdate());
    }

    render() {
        const playerProps = {
            ...this.defaultPlayerProps,
            playersCells: this.state.playerCells
        }

        const players = getPlayersTables(
            playerProps,
            this.props.gameParameters,
            this.state.gameEnd,
            this.state.playerNumberTurn);

        return (
            <div>
                <div className="message">{this.getMessage()}</div>
                {players}
                {this.renderTable()}
            </div>);
    }

    private getMessage = (): string => {
        if (this.players.length === 0)
            return "Initializing...";

        if (this.state.gameEnd) {
            return this.gameTypeProvider.getGameEndMessage(this.players, this.state.playerCells);
        }

        return this.players[this.state.playerNumberTurn].getTurnMessage();
    }

    private renderTable = () => {
        const size = this.props.gameParameters.fieldSize;

        let cellSize = 50;
        const fieldElement = document.getElementById('container');
        if (fieldElement != null) {
            cellSize = (fieldElement.offsetWidth - 350) / size;
        }

        const rows: JSX.Element[] = [];
        for (let i = 0; i < size; ++i) {
            const cells: JSX.Element[] = [];
            for (let j = 0; j < size; ++j) {
                const coordinates: Coordinates = {
                    row: i,
                    column: j
                };

                cells.push(<td
                    key={i * 100 + j}
                    style={{ "width": `${cellSize}px`, "height": `${cellSize}px` }}
                    className={this.getCellClass(coordinates)}
                    onMouseMove={() => this.players[this.state.playerNumberTurn].onMouseMove(coordinates)}
                    onClick={() => this.players[this.state.playerNumberTurn].onMouseClick(coordinates)} />);
            }
            rows.push(<tr key={`row_${i}`}>{cells}</tr>);
        }

        return (
            <table>
                <tbody>
                    {rows}
                </tbody>
            </table>);
    }

    private getCellClass = (coordinates: Coordinates): string => {
        if (this.players.length > 0) {
            const playerClass = this.players[this.state.playerNumberTurn].getCellClass(coordinates);
            if (playerClass !== null)
                return playerClass;
        }

        for (let i = 0; i < this.props.gameParameters.playersCount; ++i) {
            if (this.state.playerCells[i].some(c => c.row === coordinates.row && c.column === coordinates.column))
                return `player${i}Cell`;
        }

        return "";
    }

    private placeFigure = (figure: Coordinates[]) => {
        const playerCells = [...this.state.playerCells[this.state.playerNumberTurn], ...figure];
        const playersCells = [
            ...this.state.playerCells.slice(0, this.state.playerNumberTurn),
            playerCells,
            ...this.state.playerCells.slice(this.state.playerNumberTurn + 1)
        ];

        let playerNumberTurn = this.state.playerNumberTurn + 1;
        if (playerNumberTurn >= this.props.gameParameters.playersCount)
            playerNumberTurn = 0;

        this.setState({
            ...this.state,
            playerNumberTurn: playerNumberTurn,
            playerCells: playersCells,
            skippedCount: 0
        });
    }

    private onSkip = () => {
        let playerNumberTurn = this.state.playerNumberTurn + 1;
        if (playerNumberTurn >= this.props.gameParameters.playersCount)
            playerNumberTurn = 0;

        const skippedCount = this.state.skippedCount + 1;
        const isGameEnd = skippedCount === this.props.gameParameters.playersCount;

        this.setState({
            ...this.state,
            playerNumberTurn: playerNumberTurn,
            skippedCount: skippedCount,
            gameEnd: isGameEnd
        }, () => {
            if (isGameEnd) {
                this.addStatisticIfNeeded();
            }
        });
    }

    private onGameEnd = (message: string) => {
        if (this.state.gameEnd)
            return;

        this.setState({
            ...this.state,
            gameEnd: true
        }, () => alert(message));
    }

    private addStatisticIfNeeded = () => {
        if (CookieManager.getInstance().getConsentToCollectStatistics()) {
            const statisticElement: StatisticElement = {
                ...this.props.gameParameters,
                remoteGame: null,
                gameResult: this.gameTypeProvider.getGameResult(this.players, this.state.playerCells)
            };

            CookieManager.getInstance().addStatisticElement(statisticElement);
        }
    }
}

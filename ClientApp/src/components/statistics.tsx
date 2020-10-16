import * as React from 'react';
import { GameResult, StatisticElement } from './statisticElement';
import { ServerType, OpponentType, GameType, FigureType, GameParameters } from './gameParameters/gameParameters';
import CookieManager from './cookieManager';
import { Chart } from "chart.js";
import './statistics.css';

export default class Statistics extends React.Component {
    private fieldSizeChart: Chart | null = null;
    private figureTypeChart: Chart | null = null;
    private gameTypeChart: Chart | null = null;

    private localGameComputerChart: Chart | null = null;
    private webGamePvpResultsChart: Chart | null = null;
    private webGamePlayersChart: Chart | null = null;

    render() {
        const statistics = CookieManager.getInstance().getStatistics();

        const gameResults = [GameResult.Win, GameResult.Loss, GameResult.Draw]
            .map(gameResult => (<div key={gameResult} className="gameResult"><strong>{statistics.filter(s => s.gameResult === gameResult).length}</strong> {GameResult[gameResult].toLowerCase()}</div>));

        return (
            <div>
                <h1>You played {statistics.length} game(s)</h1>
                {gameResults}
                <div>
                    <canvas style={{ display: "inline-block" }} id="fieldSize" width="250" height="250" />
                    <canvas style={{ display: "inline-block" }} id="figureType" width="250" height="250" />
                    <canvas style={{ display: "inline-block" }} id="gameType" width="250" height="250" />
                </div>
                <h3>{this.getServerTypeMessage(statistics)}</h3>
                <div>
                    <canvas style={{ display: "inline-block" }} id="webGamePvpResults" width="250" height="250" />
                    <canvas style={{ display: "inline-block" }} id="localGameComputer" width="250" height="250" />
                    <canvas style={{ display: "inline-block" }} id="webGamePlayers" width="250" height="250" />
                </div>
            </div>);
    }

    private getServerTypeMessage = (statistics: StatisticElement[]): string | null => {
        const localGamesCount = statistics.filter(s => s.serverType === ServerType.Local).length;
        const hostGamesCount = statistics.filter(s => s.serverType === ServerType.Host).length;
        const remoteGamesCount = statistics.filter(s => s.serverType === ServerType.Remote).length;
        const webGamesCount = hostGamesCount + remoteGamesCount;

        if (webGamesCount === 0) {
            if (localGamesCount === 0) {
                return null;
            }
            return `You played ${localGamesCount} local game(s), nice!`;
        } else {
            const webGamesMessagePart = hostGamesCount > 0
                ? `${webGamesCount} web game(s), ${hostGamesCount} of which you were host`
                : `${webGamesCount} web game(s)`;

            if (localGamesCount === 0) {
                return `You have never played a local game :( But you played ${webGamesMessagePart}.`;
            }

            return `You played ${localGamesCount} local game(s) and ${webGamesMessagePart}, nice!`;
        }
    }

    componentDidMount() {
        const statistics = CookieManager.getInstance().getStatistics();

        this.fieldSizeChart = this.createFigureSizeChart(statistics);
        this.figureTypeChart = this.createFigureTypeChart(statistics);
        this.gameTypeChart = this.createGameTypeChart(statistics);

        this.localGameComputerChart = this.createLocalGameComputerChart(statistics);
        this.webGamePvpResultsChart = this.createWebGamePvpChart(statistics);
        this.webGamePlayersChart = this.createWebGamePlayersCountChart(statistics);
    }

    componentWillUnmount() {
        if (this.fieldSizeChart != null)
            this.fieldSizeChart.destroy();
        if (this.figureTypeChart != null)
            this.figureTypeChart.destroy();
        if (this.gameTypeChart != null)
            this.gameTypeChart.destroy();

        if (this.localGameComputerChart != null)
            this.localGameComputerChart.destroy();
        if (this.webGamePvpResultsChart != null)
            this.webGamePvpResultsChart.destroy();
        if (this.webGamePlayersChart != null)
            this.webGamePlayersChart.destroy();
    }

    private createFigureSizeChart = (statistics: StatisticElement[]): Chart | null => {
        const fieldSizes = [10, 15, 20, 30];

        const labels = ["Small", "Medium", "Big", "Giant"];
        const colors = ["rgb(0,255,0)", "rgb(0,0,255)", "rgb(255,0,0)", "rgb(0,0,0)"];
        const data = fieldSizes.map(fieldSize => statistics.filter(s => s.fieldSize === fieldSize).length);

        return this.createChart("fieldSize", labels, colors, data, "Games by field size");
    }

    private createFigureTypeChart = (statistics: StatisticElement[]): Chart | null => {
        const figureTypes = [FigureType.Dice, FigureType.Tetris];

        const labels = figureTypes.map(figureType => FigureType[figureType]);
        const colors = ["rgb(0,255,0)", "rgb(0,0,255)"];
        const data = figureTypes.map(figureType => statistics.filter(s => s.figureType === figureType).length);

        return this.createChart("figureType", labels, colors, data, "Games by figure");
    }

    private createGameTypeChart = (statistics: StatisticElement[]): Chart | null => {
        const gameTypes = [GameType.Pvp, GameType.Pve];

        const labels = gameTypes.map(gameType => GameType[gameType]);
        const colors = ["rgb(0,255,0)", "rgb(0,0,255)"];
        const data = gameTypes.map(gameType => statistics.filter(s => s.gameType === gameType).length);

        return this.createChart("gameType", labels, colors, data, "Games by type");
    }

    private createLocalGameComputerChart = (statistics: StatisticElement[]): Chart | null => {
        const localGameStatistics = statistics.filter(s => s.serverType === ServerType.Local && s.opponentType === OpponentType.Computer);
        if (localGameStatistics.length === 0)
            return null;

        const gameResults = [GameResult.Win, GameResult.Loss, GameResult.Draw];

        const labels = gameResults.map(gameResult => GameResult[gameResult]);;
        const colors = ["rgb(0,255,0)", "rgb(0,0,255)", "rgb(255,0,0)"];
        const data = gameResults.map(gameResult => localGameStatistics.filter(s => s.gameResult === gameResult).length);

        return this.createChart("localGameComputer", labels, colors, data, "Game results with computer");
    }

    private createWebGamePvpChart = (statistics: StatisticElement[]): Chart | null => {
        const webGameStatistics = statistics.filter(s => s.serverType !== ServerType.Local && s.gameType === GameType.Pvp);
        if (webGameStatistics.length === 0)
            return null;

        const gameResults = [GameResult.Win, GameResult.Loss, GameResult.Draw];

        const labels = gameResults.map(gameResult => GameResult[gameResult]);;
        const colors = ["rgb(0,255,0)", "rgb(0,0,255)", "rgb(255,0,0)"];
        const data = gameResults.map(gameResult => webGameStatistics.filter(s => s.gameResult === gameResult).length);

        return this.createChart("webGamePvpResults", labels, colors, data, "PvP web game results");
    }

    private createWebGamePlayersCountChart = (statistics: StatisticElement[]): Chart | null => {
        const webGameStatistics = statistics.filter(s => s.serverType !== ServerType.Local);
        if (webGameStatistics.length === 0)
            return null;

        const playersCount = [2, 3, 4];

        const labels = playersCount.map(count => `${count.toString()} players`);;
        const colors = ["rgb(0,255,0)", "rgb(0,0,255)", "rgb(255,0,0)"];
        const data = playersCount.map(count => webGameStatistics.filter(s => s.playersCount === count).length);

        return this.createChart("webGamePlayers", labels, colors, data, "Web games by players count");
    }

    private createChart = (selector: string, labels: string[], colors: string[], data: number[], title: string): Chart | null => {
        if (data.reduce((p, c) => p > c ? p : c, 0) === 0) {
            return null;
        }

        const chart = new Chart(document.getElementById(selector) as HTMLCanvasElement, {
            type: "pie",
            data: {
                labels: labels,

                datasets: [{
                    backgroundColor: colors,
                    data: data
                }]
            },
            options: {
                responsive: false,
                legend: {
                    display: true,
                    position: "bottom"
                },
                title: {
                    display: true,
                    text: title
                }
            }
        });

        return chart;
    }
}
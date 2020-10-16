import * as React from 'react';
import { Container } from 'reactstrap';
import NavMenu from './navMenu';
import GameParametersComponent from './gameParameters/gameParametersComponent';
import Field from './field';
import Welcome from './welcome';
import Statistics from './statistics';
import Settings from './settings';
import { ServerType, OpponentType, GameType, FigureType, GameParameters } from './gameParameters/gameParameters';
import { Pages } from './pages';
import CookieManager from './cookieManager';

interface Props {
}

interface State {
    page: Pages;
    gameParameters: GameParameters;
}

export default class Home extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            page: Pages.Welcome,
            gameParameters: {
                serverType: ServerType.Local,
                remoteGame: null,
                fieldSize: 15,
                opponentType: OpponentType.Computer,
                playersCount: 2,
                gameType: GameType.Pvp,
                figureType: FigureType.Dice
            }
        };
    }

    render() {
        let content: JSX.Element;
        switch (this.state.page) {
            case Pages.Welcome:
                content = <Welcome />;
                break;
            case Pages.Create:
                content = <GameParametersComponent previousGameParameters={this.state.gameParameters} onCreateNewGame={this.onCreateNewGame} />;
                break;
            case Pages.Game:
                content = <Field gameParameters={this.state.gameParameters} />;
                break;
            case Pages.Statistics:
                content = <Statistics />;
                break;
            case Pages.Settings:
                content = <Settings />;
                break;
            default:
                throw new Error("Not implemented");
        }

        const mainLinks: [Pages, string][] = [
            [Pages.Create, "Start new game"]];

        return (
            <React.Fragment>
                <NavMenu mainLinks={mainLinks} collapsedLinks={this.getCollapsedLinks()} onLinkClick={this.onLinkClick} />
                <Container id="container">
                    {content}
                </Container>
            </React.Fragment>);
    }

    private getCollapsedLinks = (): [Pages, string][] => {
        const result: [Pages, string][] = [
            [Pages.Welcome, "Home"]];

        if (CookieManager.getInstance().getConsentToCollectStatistics()) {
            result.push([Pages.Statistics, "Statistics"]);
        }

        result.push([Pages.Settings, "Settings"]);

        return result;
    }

    private onLinkClick = (page: Pages) => {
        this.setState({
            ...this.state,
            page: page
        });
    }

    private onCreateNewGame = (gameParameters: GameParameters) => {
        this.setState({
            ...this.state,
            page: Pages.Game,
            gameParameters: {
                ...gameParameters
            }
        });
    }
}
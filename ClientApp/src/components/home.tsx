import * as React from 'react';
import { Container } from 'reactstrap';
import NavMenu from './navMenu';
import GameParametersComponent from './gameParametersComponent';
import Field from './field';
import Welcome from './welcome';
import { OpponentType, GameType, FigureType, GameParameters } from './gameParameters';
import { Pages } from './pages';

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
                content = <GameParametersComponent previousParameters={this.state.gameParameters} onCreateNewGame={this.onCreateNewGame} />;
                break;
            case Pages.Game:
                content = <Field gameParameters={this.state.gameParameters} />;
                break;
            default:
                throw new Error("Not implemented");
        }

        const links: [Pages, string][] = [
            [Pages.Welcome, "Home"],
            [Pages.Create, "Start new game"]];

        return (
            <React.Fragment>
                <NavMenu links={links} onLinkClick={this.onLinkClick}/>
                <Container id="container">
                    {content}
                </Container>
            </React.Fragment>);
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
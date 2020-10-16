import * as React from 'react';
import { Collapse, Container, Navbar, NavbarBrand, NavbarToggler, Nav, NavItem, NavLink } from 'reactstrap';
import { Link } from 'react-router-dom';
import './navMenu.css';
import { Pages } from './pages';

interface Props {
    mainLinks: [Pages, string][];
    collapsedLinks: [Pages, string][];
    onLinkClick: (page: Pages) => void;
}

interface State {
    isOpen: boolean;
}

export default class NavMenu extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            isOpen: false
        };
    }

    render() {
        const mainLinks = this.props.mainLinks.map(link => <NavLink key={link[0]} tag={Link} className="text-dark" onClick={() => this.props.onLinkClick(link[0])} to="/">{link[1]}</NavLink>);
        const collapsedLinks = this.props.collapsedLinks.map(link => <NavLink key={link[0]} tag={Link} className="text-dark" onClick={() => this.props.onLinkClick(link[0])} to="/">{link[1]}</NavLink>);

        return (
            <header>
                <Navbar className="border-bottom box-shadow mb-3" light>
                    <Container>
                        <NavbarBrand to="/" tag={Link} className="mr-auto">SquareGame</NavbarBrand>
                        {mainLinks}
                        <NavbarToggler onClick={this.toggle} className="mr-2" />
                        <Collapse isOpen={this.state.isOpen} navbar>
                            <Nav navbar>
                                {collapsedLinks}
                            </Nav>
                        </Collapse>
                    </Container>
                </Navbar>

               
            </header>
        );
    }

    private toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }
}
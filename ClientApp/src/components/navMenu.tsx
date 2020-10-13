import * as React from 'react';
import { Collapse, Container, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';
import { Link } from 'react-router-dom';
import './navMenu.css';
import { Pages } from './pages';

interface Props {
    links: [Pages, string][];
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

    public render() {
        const links = this.props.links.map(link => <NavLink key={link[0]} tag={Link} className="text-dark" onClick={() => this.props.onLinkClick(link[0])} to="/">{link[1]}</NavLink>);

        return (
            <header>
                <Navbar className="navbar-expand-sm navbar-toggleable-sm border-bottom box-shadow mb-3" light>
                    <Container>
                        <NavbarBrand tag={Link} to="/">SquareGame</NavbarBrand>
                        <NavbarToggler onClick={this.toggle} className="mr-2"/>
                        <Collapse className="d-sm-inline-flex flex-sm-row-reverse" isOpen={this.state.isOpen} navbar>
                            <ul className="navbar-nav flex-grow">
                                <NavItem>
                                    {links}
                                </NavItem>
                            </ul>
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

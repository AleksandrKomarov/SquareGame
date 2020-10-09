import * as React from 'react';
import { Coordinates } from '../coordinates';
import './tetris.css';

interface Props {
    figure: Coordinates[];
}

export default class Tetris extends React.Component<Props> {
    render() {
        const firstRow: JSX.Element[] = [];
        for (let i = 0; i < 4; ++i) {
            firstRow.push(
                this.props.figure.some(c => c.row === 0 && c.column === i)
                    ? <td key={`0${i}`} className="tetris filled" />
                    : <td key={`1${i}`} className="tetris"/>);
        }

        const secondRow: JSX.Element[] = [];
        for (let i = 0; i < 4; ++i) {
            secondRow.push(
                this.props.figure.some(c => c.row === 1 && c.column === i)
                    ? <td key={`2${i}`}className="tetris filled" />
                    : <td key={`3${i}`} className="tetris"/>);
        }

        return (
            <table>
                <tbody>
                    <tr>{firstRow}</tr>
                    <tr>{secondRow}</tr>
                </tbody>
            </table>);
    }
}

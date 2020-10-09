import * as React from 'react';
import "./dice.css";

interface Props {
    value: number;
}

export default class Dice extends React.Component<Props> {
    render() {
        const pips = Array(this.props.value)
            .fill(0)
            .map((_, i) => <span key={i} className="pip" />);
        return <div className="face">{pips}</div>;
    }
}

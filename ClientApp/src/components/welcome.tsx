import * as React from 'react';

export default class Welcome extends React.Component {
    render() {
        return (
            <div>
                <img src="game.jpg" alt="Game process" width="300px" />
                <h3>Quick, simple and fun game to play with a friend/friends or a computer.</h3>
                <p>Roll dice and get the figure size or shape (in tetris mode).</p>
                <p>Place your figure in a vacant space starting from your corner. Expand your territory by adding new figures to the ones on the field. All your figures should be attached to each other.</p>
                <p>If needed you may rotate the figure. For every figure placed you get winning points equal to the figure size.</p>
                <p>If there is no room for the figure, skip your turn. If all players skip their turn, the game ends. The winner is the one who outnumbers the other players. </p>
                <p>Also try PvE-mode. In this mode you cooperate with another player against the field. Your task is to place all figures leaving as little gaps as possible.</p>
            </div>);
    }
}
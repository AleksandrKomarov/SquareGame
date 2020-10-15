using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Threading;

namespace SquareGame
{
    public class GameStorage
    {
        private readonly object _lockObject = new object();
        private readonly Dictionary<Guid, List<WebSocket>> _games = new Dictionary<Guid, List<WebSocket>>();
        private readonly HashSet<Guid> _startedGames = new HashSet<Guid>();

        public Guid StartGame()
        {
            var gameGuid = Guid.NewGuid();
            lock (_lockObject)
            {
                _games.Add(gameGuid, new List<WebSocket>(4));
            }
            return gameGuid;
        }

        public async void EndGame(Guid gameGuid)
        {
            List<WebSocket> webSocketsToClose;
            lock (_lockObject)
            {
                if (!_games.Remove(gameGuid, out var webSockets))
                    return;

                webSocketsToClose = webSockets.ToList();
            }

            for (var i = 0; i < webSocketsToClose.Count; ++i)
            {
                await webSocketsToClose[i].CloseAsync(WebSocketCloseStatus.NormalClosure, "Game end", CancellationToken.None);
            }
        }

        public bool TryAddPlayer(Guid gameGuid, WebSocket webSocket)
        {
            lock (_lockObject)
            {
                if (!_games.ContainsKey(gameGuid))
                    return false;

                if (_startedGames.Contains(gameGuid))
                    return false;

                var webSockets = _games[gameGuid];
                if (webSockets.Count == 4)
                    return false;

                webSockets.Add(webSocket);
                SendPlayerNumber(webSocket, webSockets.Count);
                SendPlayersCount(gameGuid);
                return true;
            }
        }

        public void TryRemovePlayer(Guid gameGuid, WebSocket webSocket)
        {
            bool shouldEndGame = false;

            lock (_lockObject)
            {
                if (!_games.ContainsKey(gameGuid))
                    return;

                _games[gameGuid].Remove(webSocket);

                SendPlayersCount(gameGuid);

                shouldEndGame = _startedGames.Contains(gameGuid);
            }

            if (shouldEndGame)
                EndGame(gameGuid);
        }

        public void MarkGameAsStarted(Guid gameGuid)
        {
            lock (_lockObject)
            {
                _startedGames.Add(gameGuid);
            }
        }

        public async void NotifyOthers(Guid gameGuid, WebSocket sender, ArraySegment<byte> message)
        {
            List<WebSocket> webSocketsToNotify;
            lock (_lockObject)
            {
                if (!_games.ContainsKey(gameGuid))
                    return;

                webSocketsToNotify = _games[gameGuid].Where(webSocket => webSocket != sender).ToList();
            }

            foreach (var webSocket in webSocketsToNotify)
            {
                if (!webSocket.CloseStatus.HasValue)
                    await webSocket.SendAsync(message, WebSocketMessageType.Text, true, CancellationToken.None);
            }
        }

        private static async void SendPlayerNumber(WebSocket webSocket, int playerNumber)
        {
            var message = new Message
            {
                Type = MessageType.PlayerNumber,
                Data = playerNumber
            };

            var serializedMessage = JsonSerializer.Serialize(message);
            var messageBytes = Encoding.UTF8.GetBytes(serializedMessage);

            if (!webSocket.CloseStatus.HasValue)
                await webSocket.SendAsync(
                    new ArraySegment<byte>(messageBytes),
                    WebSocketMessageType.Text,
                    true,
                    CancellationToken.None);
        }

        private void SendPlayersCount(Guid gameGuid)
        {
            var webSockets = _games[gameGuid];

            var message = new Message
            {
                Type = MessageType.PlayersChanged,
                Data = webSockets.Count
            };

            var serializedMessage = JsonSerializer.Serialize(message);
            var messageBytes = Encoding.UTF8.GetBytes(serializedMessage);

            webSockets.ForEach(async webSocket =>
            {
                if (!webSocket.CloseStatus.HasValue)
                    await webSocket.SendAsync(
                        new ArraySegment<byte>(messageBytes),
                        WebSocketMessageType.Text,
                        true,
                        CancellationToken.None);
            });
        }
    }
}
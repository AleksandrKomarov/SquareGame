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
        private readonly Dictionary<Guid, string> _publicGames = new Dictionary<Guid, string>();

        public Guid StartPublicGame(string gameName)
        {
            var gameGuid = Guid.NewGuid();
            lock (_lockObject)
            {
                _games.Add(gameGuid, new List<WebSocket>(4));
                _publicGames.Add(gameGuid, gameName);
            }
            return gameGuid;
        }

        public Guid StartPrivateGame()
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

                _publicGames.Remove(gameGuid);

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

                SendPlayersNumbers(webSockets);
                SendPlayersCount(gameGuid);
                return true;
            }
        }

        public void TryRemovePlayer(Guid gameGuid, WebSocket webSocket)
        {
            var shouldEndGame = false;

            lock (_lockObject)
            {
                if (!_games.ContainsKey(gameGuid))
                    return;

                var webSockets = _games[gameGuid];

                var playerIndex = webSockets.IndexOf(webSocket);

                webSockets.Remove(webSocket);

                shouldEndGame = playerIndex == 0 || _startedGames.Contains(gameGuid);

                if (!shouldEndGame)
                {
                    SendPlayersNumbers(webSockets);
                    SendPlayersCount(gameGuid);
                }
            }

            if (shouldEndGame)
                EndGame(gameGuid);
        }

        public void MarkGameAsStarted(Guid gameGuid)
        {
            lock (_lockObject)
            {
                _startedGames.Add(gameGuid);
                _publicGames.Remove(gameGuid);
            }
        }

        public PublicGameDto[] GetPublicGames()
        {
            return _publicGames
                .Select(kvp => new PublicGameDto
                {
                    GameGuid = kvp.Key,
                    Name = kvp.Value
                })
                .ToArray();
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

        private static void SendPlayersNumbers(IEnumerable<WebSocket> webSockets)
        {
            var random = new Random();
            var sortedWebSockets = webSockets.OrderBy(ws => random.Next()).ToList();
            for (var i = 0; i < sortedWebSockets.Count; ++i)
            {
                SendPlayerNumber(sortedWebSockets[i], i);
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
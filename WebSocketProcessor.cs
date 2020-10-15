using System;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace SquareGame
{
    public static class WebSocketProcessor
    {
        public static async Task Process(HttpContext context, WebSocket webSocket)
        {
            if (!TryGetGameGuid(context, out var gameGuid))
            {
                await webSocket.CloseAsync(WebSocketCloseStatus.ProtocolError, "Incorrect gameGuid", CancellationToken.None);
                return;
            }

            var gameStorage = context.RequestServices.GetService<GameStorage>();

            if (!gameStorage.TryAddPlayer(gameGuid, webSocket))
            {
                await webSocket.CloseAsync(WebSocketCloseStatus.ProtocolError, "Incorrect gameGuid", CancellationToken.None);
                return;
            }

            var buffer = new byte[1024 * 4];
            var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            while (!result.CloseStatus.HasValue)
            {
                var message = JsonSerializer.Deserialize<Message>(Encoding.UTF8.GetString(buffer, 0, result.Count));
                if (message.Type == MessageType.GameStarted)
                {
                    gameStorage.MarkGameAsStarted(gameGuid);
                }

                gameStorage.NotifyOthers(gameGuid, webSocket, new ArraySegment<byte>(buffer, 0, result.Count));

                result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            }

            gameStorage.TryRemovePlayer(gameGuid, webSocket);

            await webSocket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, CancellationToken.None);
        }

        private static bool TryGetGameGuid(HttpContext context, out Guid gameGuid)
        {
            gameGuid = Guid.Empty;

            if (!context.Request.Query.ContainsKey("gameGuid"))
                return false;

            return Guid.TryParse(context.Request.Query["gameGuid"], out gameGuid);
        }
    }
}
using System.Text.Json.Serialization;

namespace SquareGame
{
    public enum MessageType
    {
        PlayerNumber = 0,
        PlayersChanged = 1,
        GameStarted = 2
    }

    public class Message
    {
        [JsonPropertyName("type")]
        public MessageType Type { get; set; }
        [JsonPropertyName("data")]
        public object Data { get; set; }
    }
}
using System;
using System.Text.Json.Serialization;

namespace SquareGame
{
    public class PublicGameDto
    {
        [JsonPropertyName("gameGuid")]
        public Guid GameGuid { get; set; }
        [JsonPropertyName("name")]
        public string Name { get; set; }
    }
}
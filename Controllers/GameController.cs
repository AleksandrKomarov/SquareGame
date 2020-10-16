using System;
using Microsoft.AspNetCore.Mvc;

namespace SquareGame.Controllers
{
    [Route("api/[controller]")]
    public class GameController : Controller
    {
        private readonly GameStorage _gameStorage;

        public GameController(GameStorage gameStorage)
        {
            _gameStorage = gameStorage;
        }

        [HttpPost("[action]")]
        public JsonResult StartNew(string gameName)
        {
            var gameGuid = string.IsNullOrWhiteSpace(gameName)
                ? _gameStorage.StartPrivateGame()
                : _gameStorage.StartPublicGame(gameName);
            return Json(gameGuid);
        }

        [HttpPost("[action]")]
        public JsonResult End(Guid gameGuid)
        {
            _gameStorage.EndGame(gameGuid);
            return Json(null);
        }

        [HttpGet("[action]")]
        public JsonResult GetPublicGames()
        {
            return Json(_gameStorage.GetPublicGames());
        }
    }
}

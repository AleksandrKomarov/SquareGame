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
        public JsonResult StartNew()
        {
            var gameGuid = _gameStorage.StartGame();
            return Json(gameGuid);
        }

        [HttpPost("[action]")]
        public JsonResult End(Guid gameGuid)
        {
            _gameStorage.EndGame(gameGuid);
            return Json(null);
        }
    }
}

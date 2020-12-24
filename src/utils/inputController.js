export class inputController {

	constructor(canvas, player){
		window.addEventListener('keydown', (e) => {
			if (!e.repeat) {
				switch(e.key) {
					case "ArrowUp": player.animationParameters.velocity = -150; break;
					case "ArrowDown": player.animationParameters.velocity = 150; break;
					case "ArrowRight": player.animationParameters.rotate.y = -60; break;
					case "ArrowLeft": player.animationParameters.rotate.y = 60; break;
				}
			}
		});
		window.addEventListener('keyup', (e) => {
			switch(e.key) {
				case "ArrowUp": player.animationParameters.velocity = 0; break;
				case "ArrowDown": player.animationParameters.velocity = 0; break;
				case "ArrowRight": player.animationParameters.rotate.y = 0; break;
				case "ArrowLeft": player.animationParameters.rotate.y = 0; break;
			}
		});
	}
}
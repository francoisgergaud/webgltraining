export class inputController {

	constructor(canvas, camera){
		window.addEventListener('keydown', (e) => {
			if (!e.repeat) {
				switch(e.key) {
					case "ArrowUp": camera.animationParameters.velocity = -150; break;
					case "ArrowDown": camera.animationParameters.velocity = 150; break;
					case "ArrowRight": camera.animationParameters.rotate.y = -60; break;
					case "ArrowLeft": camera.animationParameters.rotate.y = 60; break;
				}
			}
		});
		window.addEventListener('keyup', (e) => {
			switch(e.key) {
				case "ArrowUp": camera.animationParameters.velocity = 0; break;
				case "ArrowDown": camera.animationParameters.velocity = 0; break;
				case "ArrowRight": camera.animationParameters.rotate.y = 0; break;
				case "ArrowLeft": camera.animationParameters.rotate.y = 0; break;
			}
		});
	}
}
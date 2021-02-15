/**
 * the player:
 * - control the cmera view. 
 * - movement ae limited by the terrain. 
 */
export class Player {

	constructor(terrain){
		this.terrain = terrain;
		var xPosition = (terrain.gridWidth/2) * terrain.cellSize;
		var zPosition = (terrain.gridHeight/2) * terrain.cellSize;
		var yPosition = this.terrain.getCell(xPosition, zPosition).height + terrain.cellSize;
		this.position = {
			x: xPosition,
			y: yPosition,
			z: zPosition,
	    };
		this.rotation = {
			x: 0,
			y: 0,
			z: 0,
	    };
		this.animationParameters = {
			velocity: 0,
			verticalVelocity: 100,
			rotate: {
				x: 0,
				y: 0,
				z: 0,
			}
		}
	}

	setCamera(camera){
		this.camera = camera;
	}

	setMiniMap(miniMap){
		this.miniMap = miniMap;
	}

	setRotation(rotation) {
		this.rotation = rotation;
	}

	update(deltaTimeSecond){
		this.rotation.x += this.animationParameters.rotate.x * deltaTimeSecond;
	    this.rotation.y += this.animationParameters.rotate.y * deltaTimeSecond;
	    this.rotation.z += this.animationParameters.rotate.z * deltaTimeSecond;
	    this.rotation.x %= 360;
		if(this.rotation.x < 0 ){
			this.rotation.x += 360;
		}
		this.rotation.y %= 360;
		if(this.rotation.y < 0 ){
			this.rotation.y += 360;
		}
		this.rotation.z %= 360;
		if(this.rotation.z < 0 ){
			this.rotation.z += 360;
		}
		var offsetZ = (-this.animationParameters.velocity * deltaTimeSecond) * Math.cos(this.rotation.y * Math.PI / 180);
		var offsetX = (-this.animationParameters.velocity * deltaTimeSecond) * Math.sin(this.rotation.y * Math.PI / 180);
		this.position.z += offsetZ;
	    this.position.x += offsetX;

	    //the camera is a bit above the floor level, here cellSize is the height (could be anything else)
	    this.targetPositionY = this.terrain.getHeight(this.position.x, this.position.z) + this.terrain.cellSize;

		// smooth the vertical movement
		if(this.position.y !== this.targetPositionY){
			if(this.position.y > this.targetPositionY) {
				this.position.y-=this.animationParameters.verticalVelocity*deltaTimeSecond;
				if(this.position.y < this.targetPositionY){
					this.position.y = this.targetPositionY;
				}
			} else {
				this.position.y+=this.animationParameters.verticalVelocity*deltaTimeSecond;
				if(this.position.y > this.targetPositionY){
					this.position.y = this.targetPositionY;
				}
			}
		}

		// when camera rotation is 0, it points to the -Z axis, not the +X axis
		this.camera.setRotation(this.rotation.x, this.rotation.y, this.rotation.z);
		this.camera.setPosition(this.position.x, this.position.y, this.position.z);
		this.miniMap.setPlayerPosition(this.position.x, this.position.z);
	}
}
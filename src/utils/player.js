/**
 * the player:
 * - control the cmera view. 
 * - movement ae limited by the terrain. 
 */
export class Player {

	constructor(camera, terrain){
		this.camera = camera;
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
		this.camera.setRotation(this.rotation.x, this.rotation.y, this.rotation.z);
		// when camera rotation is 0, it points to the -Z axis, not the X+ axis
		var offsetZ = (-this.animationParameters.velocity * deltaTimeSecond) * Math.cos(this.rotation.y * Math.PI / 180);
		var offsetX = (-this.animationParameters.velocity * deltaTimeSecond) * Math.sin(this.rotation.y * Math.PI / 180);
		this.position.z += offsetZ;
	    this.position.x += offsetX;
		//set the height depending on the terrain
		var cell = this.terrain.getCell(this.position.x, this.position.z);
		if(cell != null) {
			this.targetPositionY = cell.height + this.terrain.cellSize;
			//this.position.y = cellHeight-this.terrain.voxelSize;
		}
		//smooth the vertical movement
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
		//the y axis is inverted for the camera
		this.camera.setPosition(this.position.x, this.position.y, this.position.z);
	}
}
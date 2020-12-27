export class Player {

	constructor(camera, terrain){
		this.camera = camera;
		this.terrain = terrain;
		this.position = {
			x: 0,
			y: 0,
			z: 0,
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
		this.position.z += (this.animationParameters.velocity * deltaTimeSecond) * Math.cos(this.rotation.y * Math.PI / 180);
	    this.position.x += (this.animationParameters.velocity * deltaTimeSecond) * Math.sin(this.rotation.y * Math.PI / 180);
		//set the height depending on the terrain
		if(this.position.x > 0 && this.position.x < this.terrain.gridWidth*this.terrain.voxelSize
			&& -this.position.z > 0 && -this.position.z < this.terrain.gridHeight*this.terrain.voxelSize) {
			var cellHeight = this.terrain.cells[Math.floor(this.position.x/this.terrain.voxelSize)][Math.floor(-this.position.z/this.terrain.voxelSize)].height;
			this.targetPositionY = cellHeight-this.terrain.voxelSize;
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
		this.camera.setPosition(this.position.x, -this.position.y, this.position.z);
	}
}
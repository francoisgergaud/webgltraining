import {m4} from './matrix.js';

export class lookAtCamera {

	constructor(viewWidth, viewHeight, zNear, zFar, fieldOfViewRadian, cameraPosition, cameraTarget){
		this.viewWidth = viewWidth;
		this.viewHeight = viewHeight;
		this.zNear = zNear;
		this.zFar = zFar;
		this.fieldOfViewRadian = fieldOfViewRadian;
		this.position = cameraPosition;
		this.target = cameraTarget;
	    this.rotation = {
			x: 0,
			y: 0,
			z: 0,
	    };
	    this.animationParameters = {
			velocity: 0,
			rotate: {
				x: 0,
				y: 0,
				z: 0,
			}
		}
	}

	animate(deltaTimeSecond){
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
		this.position.z += (this.animationParameters.velocity * deltaTimeSecond) * Math.cos(this.rotation.y * Math.PI / 180);
	    this.position.x += (this.animationParameters.velocity * deltaTimeSecond) * Math.sin(this.rotation.y * Math.PI / 180);
	}

	getViewProjectionMatrix(){
		var aspect = this.viewWidth / this.viewHeight;	    
		var projectionMatrix = m4.perspective(this.fieldOfViewRadian, aspect, this.zNear, this.zFar);
		var cameraMatrix = null;
		if(this.target != null){
			var up = [0, 1, 0];
		    // Compute the camera's matrix using look at.
		    var position = [this.position.x, this.position.y, this.position.z];
		    cameraMatrix = m4.lookAt(position, this.target, up);
		} else {
			console.log("camera position x: " + this.position.x + ", y: "+ this.position.y + ",z: "+ this.position.z + ",x rot: "+ this.rotation.x + ",y rot: "+ this.rotation.y);
			cameraMatrix = m4.translation(this.position.x, this.position.y, this.position.z);
			cameraMatrix = m4.xRotate(cameraMatrix, this.rotation.x * Math.PI / 180);
			cameraMatrix = m4.yRotate(cameraMatrix, this.rotation.y * Math.PI / 180);
			cameraMatrix = m4.zRotate(cameraMatrix, this.rotation.z * Math.PI / 180);
			// cameraMatrix = m4.xRotation(this.rotation.x * Math.PI / 180);
			// cameraMatrix = m4.yRotate(cameraMatrix, this.rotation.y * Math.PI / 180);
			// cameraMatrix = m4.zRotate(cameraMatrix, this.rotation.z * Math.PI / 180);
			// cameraMatrix = m4.translate(cameraMatrix, this.position.x, this.position.y, this.position.z);
		}
		// Make a view matrix from the camera matrix.
	    var viewMatrix = m4.inverse(cameraMatrix);
	    // Compute a view projection matrix
	    return m4.multiply(projectionMatrix, viewMatrix);
	}

	setTarget(targetPosition){
		this.target = targetPosition;
	}
}
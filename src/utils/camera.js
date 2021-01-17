import {m4} from './matrix.js';

export class LookAtCamera {

	constructor(viewWidth, viewHeight, zNear, zFar, fieldOfViewRadian, cameraTarget){
		this.viewWidth = viewWidth;
		this.viewHeight = viewHeight;
		this.zNear = zNear;
		this.zFar = zFar;
		this.fieldOfViewRadian = fieldOfViewRadian;
		this.target = cameraTarget;
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
	}

	setPosition(x, y, z){
		this.position.x = x;
		this.position.y = y;
		this.position.z = z;
	}

	setRotation(x, y, z){
		this.rotation.x = x;
		this.rotation.y = y;
		this.rotation.z = z;
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
			//console.log("camera position x: " + this.position.x + ", y: "+ this.position.y + ",z: "+ this.position.z + ",x rot: "+ this.rotation.x + ",y rot: "+ this.rotation.y);
			cameraMatrix = m4.translation(this.position.x, this.position.y, this.position.z);
			cameraMatrix = m4.zRotate(cameraMatrix, this.rotation.z * Math.PI / 180);
			cameraMatrix = m4.xRotate(cameraMatrix, this.rotation.x * Math.PI / 180);
			cameraMatrix = m4.yRotate(cameraMatrix, this.rotation.y * Math.PI / 180);
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
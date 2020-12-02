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
	}

	getViewProjectionMatrix(){
		var aspect = this.viewWidth / this.viewHeight;	    
	    var projectionMatrix = m4.perspective(this.fieldOfViewRadian, aspect, this.zNear, this.zFar);
	    var up = [0, -1, 0];
	    // Compute the camera's matrix using look at.
	    var cameraMatrix = m4.lookAt(this.position, this.target, up);
	    // Make a view matrix from the camera matrix.
	    var viewMatrix = m4.inverse(cameraMatrix);
	    // Compute a view projection matrix
	    return m4.multiply(projectionMatrix, viewMatrix);
	}

	setTarget(targetPosition){
		this.target = targetPosition;
	}
}
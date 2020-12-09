var webGLUtils = {

	setAttributes: function(gl, attributes){
		for (var key in attributes) {
			//console.log("loading attributes " + key);
			var location = attributes[key].location;
			gl.enableVertexAttribArray(location);
		    gl.bindBuffer(gl.ARRAY_BUFFER, attributes[key].buffer);
		    gl.vertexAttribPointer(location, attributes[key].size, attributes[key].type, attributes[key].normalize, attributes[key].stride, attributes[key].offset);
		}
	}
}

export {webGLUtils};
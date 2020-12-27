export var coloredVertexShader =`
	attribute vec4 a_position;
	attribute vec4 a_color;
	attribute vec3 a_normal;
	 
	uniform mat4 u_worldViewProjection;
	uniform mat4 u_world;
	 
	varying vec4 v_color;
	varying vec3 v_normal;
	 
	void main() {
	  // Multiply the position by the matrix.
	  gl_Position = u_worldViewProjection * a_position;
	 
	  // Pass the color to the fragment shader.
	  v_color = a_color;
	  //pass the normal to the shader
	  v_normal = mat3(u_world) * a_normal;
	}
`;

export var coloredFragmentShader =`
	precision mediump float;
	 
	uniform vec3 u_reverseLightDirection;
 
	// Passed in from the vertex shader.
	varying vec4 v_color;
	varying vec3 v_normal;
	 
	void main() {
		vec3 normal = normalize(v_normal);
 		float light = dot(normal, u_reverseLightDirection);
		gl_FragColor = v_color;
		// multiply just the color portion (not the alpha) by the light
	    gl_FragColor.rgb *= light;
	}
`;

export var coloredShaderAttributeNames = ['a_position', 'a_color', 'a_normal'];
export var coloredShaderUniformNames = ['u_worldViewProjection', 'u_world', 'u_reverseLightDirection'];
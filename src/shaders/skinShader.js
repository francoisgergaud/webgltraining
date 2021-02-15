export var skinnedVertexShader =`
	attribute vec4 a_position;
	attribute vec4 a_color;
	attribute vec3 a_normal;
	attribute float a_boneNdx;  // 1 bone indices per vertex

	uniform mat4 u_bones[10];    // 1 matrix per bone
	uniform mat4 u_worldViewProjection;
	uniform mat4 u_world;
	 
	varying vec4 v_color;
	varying vec3 v_normal;
	 
	void main() {
	  // Multiply the position by the matrix.
	  gl_Position = u_worldViewProjection * (u_bones[int(a_boneNdx)] * a_position);
	 
	  // Pass the color to the fragment shader.
	  v_color = a_color;
	  //pass the normal to the shader
	  v_normal = mat3(u_world) * a_normal;
	}
`;

export var skinnedFragmentShader =`
	precision mediump float;
	 
	uniform vec3 u_reverseLightDirection;
	uniform float u_transparency;
 
	// Passed in from the vertex shader.
	varying vec4 v_color;
	varying vec3 v_normal;
	 
	void main() {
		vec3 normal = normalize(v_normal);
 		float light = dot(normal, u_reverseLightDirection);
		gl_FragColor = v_color;
		// multiply just the color portion (not the alpha) by the light
	    gl_FragColor.rgb *= light;
	    gl_FragColor.a = u_transparency;
	}
`;

export var skinnedShaderAttributeNames = ['a_position', 'a_color', 'a_normal', 'a_boneNdx'];
export var skinnedShaderUniformNames = ['u_worldViewProjection', 'u_world', 'u_reverseLightDirection', 'u_transparency', 'u_bones'];
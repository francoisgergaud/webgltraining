export var texturedVertexShader =`
	// an attribute will receive data from a buffer
	attribute vec4 a_position;
	attribute vec2 a_texcoord;

	uniform mat4 u_matrix;

	varying vec2 v_texcoord;
	
	void main() {
		gl_Position = u_matrix * a_position;
		
		// Pass the texcoord to the fragment shader.
  		v_texcoord = a_texcoord;
	}
`;

export var texturedFragmentShader =`
	// fragment shaders don't have a default precision so we need
	// to pick one. mediump is a good default
	precision mediump float;
	
	// Passed in from the vertex shader.
	varying vec2 v_texcoord;

	// The texture.
	uniform sampler2D u_texture;

	void main() {
		gl_FragColor = texture2D(u_texture, v_texcoord);
	}
`;

export var texturedShaderAttributeNames = ['a_position', 'a_texcoord'];
export var texturedShaderUniformNames = ['u_matrix'];
export default `
	// an attribute will receive data from a buffer
	attribute vec2 a_position;
	uniform vec2 u_translation;
	uniform vec2 u_resolution;
	// all shaders have a main function
	void main() {

	// Add in the translation.
	vec2 position = a_position + u_translation;

	vec2 zeroToOne = position /u_resolution;
	vec2 zeroToTwo = zeroToOne * 2.0;
	vec2 clipSpace = zeroToTwo - 1.0;

	// gl_Position is a special variable a vertex shader
	// is responsible for setting
	gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
	}
`;
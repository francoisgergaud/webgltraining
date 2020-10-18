export default `
	// an attribute will receive data from a buffer
	attribute vec2 a_position;
	uniform vec2 u_translation;
	uniform vec2 u_resolution;
	uniform vec2 u_rotation;
	uniform vec2 u_scale;
	// all shaders have a main function
	void main() {

		// Scale the position
 		vec2 scaledPosition = a_position * u_scale;

		// Rotate the position
		vec2 rotatedPosition = vec2(
	        scaledPosition.x * u_rotation.y + scaledPosition.y * u_rotation.x,
     		scaledPosition.y * u_rotation.y - scaledPosition.x * u_rotation.x
     	);

		// Add in the translation.
		vec2 position = rotatedPosition + u_translation;

		vec2 zeroToOne = position /u_resolution;
		vec2 zeroToTwo = zeroToOne * 2.0;
		vec2 clipSpace = zeroToTwo - 1.0;

		// gl_Position is a special variable a vertex shader
		// is responsible for setting
		gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
	}
`;
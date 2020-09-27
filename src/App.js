import React from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import WebGLCanvas from './WebGLCanvas.js';
import VertexShader from './vertexShader.js';
import FragmentShader from './fragmentShader.js';
import Slider from 'react-input-slider';

class App extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      glContext: null,
      animationState: false,
      translateDirectionX: true,
      translateDirectionY: true,
      translation: [0, 0],
      width: 100,
      height: 30,
      color: [Math.random(), Math.random(), Math.random(), 1],
      program: null,
      timer: null,
      translationX: 10,
      translationY: 10
    };
  }

  render() {
    return (
      <Container fluid className="p-3 MainRow">
        <Row className="MainRow">
          <Col xs={8} className="MainRow">
            <WebGLCanvas afterInit={ this.setGlContext.bind(this)}/>
          </Col>
          <Col>
            <>
              <div>{'x: ' + this.state.translationX}</div>
              <Slider
                axis="x"
                xstep={1}
                xmin={1}
                xmax={20}
                x={this.state.translationX}
                onChange={({ x }) => this.setState({ translationX: x})}
              />
            </>
            <>
              <div>{'y: ' + this.state.translationY}</div>
              <Slider
                axis="x"
                xstep={1}
                xmin={1}
                xmax={20}
                x={this.state.translationY}
                onChange={({ x }) => this.setState({ translationY: x})}
              />
            </>
            <div>
              <Button onClick={() => this.handleAnimationClick()}>Start/Stop</Button>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  handleAnimationClick() {
    if(!this.state.animationState){
      this.setState({timer: setInterval(
        function(){
          if(this.state.translation[0] > this.state.width){
            this.setState({translateDirectionX: false});
          } else if (this.state.translation[0] < 0){
            this.setState({translateDirectionX: true});
          } 
          if(this.state.translateDirectionX){
            this.state.translation[0] += this.state.translationX;
          } else {
            this.state.translation[0] -= this.state.translationX;
          }
          if(this.state.translation[1] > this.state.height){
            this.setState({translateDirectionY: false});
          } else if (this.state.translation[1] < 0){
            this.setState({translateDirectionY: true});
          } 
          if(this.state.translateDirectionY){
            this.state.translation[1] += this.state.translationY;
          } else {
            this.state.translation[1] -= this.state.translationY;
          }
          this.drawScene(this.state.glContext, this.state.program, this.state.translation, this.state.positionAttributeLocation, this.state.translationLocation, this.state.resolutionUniformLocation, this.state.colorUniformLocation, this.state.positionBuffer, this.state.color);
        }.bind(this)
      , 25)});
    }else {
      clearInterval(this.state.timer);
    }
    this.setState({animationState: !this.state.animationState});
  }


  setGlContext(glContext, width, height) {
    var vertexShaderSource = VertexShader;
    var fragmentShaderSource = FragmentShader;
    var vertexShader = this.createShader(glContext, glContext.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = this.createShader(glContext, glContext.FRAGMENT_SHADER, fragmentShaderSource);
    var program = this.createProgram(glContext, vertexShader, fragmentShader);
    this.setState({
      glContext: glContext, 
      width: width, 
      height: height,
      program: program,
      positionAttributeLocation: glContext.getAttribLocation(program, "a_position"),
      translationLocation: glContext.getUniformLocation(program, "u_translation"),
      resolutionUniformLocation: glContext.getUniformLocation(program, "u_resolution"),
      colorUniformLocation: glContext.getUniformLocation(program, "u_color"),
      positionBuffer: glContext.createBuffer()
    });
    
  }

  createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
  }

  createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  }

  // Draw a the scene.
  drawScene(gl, program, translation, positionLocation, translationLocation, resolutionLocation, colorLocation, positionBuffer, color) {
    //webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas.
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the attribute
    gl.enableVertexAttribArray(positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Setup a rectangle
    this.drawShape(gl);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionLocation, size, type, normalize, stride, offset)

    // Set the translation.
    gl.uniform2fv(translationLocation, translation);

    // set the resolution
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

    // set the color
    gl.uniform4fv(colorLocation, color);

    // Draw the rectangle.
    var primitiveType = gl.TRIANGLES;
    var count = 18;
    gl.drawArrays(primitiveType, offset, count);
  }

  // Returns a random integer from 0 to range - 1.
  randomInt(range) {
    return Math.floor(Math.random() * range);
  }

  drawShape(gl) {
    // NOTE: gl.bufferData(gl.ARRAY_BUFFER, ...) will affect
    // whatever buffer is bound to the `ARRAY_BUFFER` bind point
    // but so far we only have one buffer. If we had more than one
    // buffer we'd want to bind that buffer to `ARRAY_BUFFER` first.

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      // left column
      0, 0,
      30, 0,
      0, 150,
      0, 150,
      30, 0,
      30, 150,

      // top rung
      30, 0,
      100, 0,
      30, 30,
      30, 30,
      100, 0,
      100, 30,

      // middle rung
      30, 60,
      67, 60,
      30, 90,
      30, 90,
      67, 60,
      67, 90,
    ]), gl.STATIC_DRAW);
  }

}

export default App;

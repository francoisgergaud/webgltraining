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
import {Knob} from "react-rotary-knob";

class App extends React.Component {

  // the constructor: initialize the state
  constructor(props){
    super(props);
    this.state = {
      animationContext: {
        animationState: false,
        translateDirectionX: true,
        translateDirectionY: true,
        translationOffsetX: 10,
        translationOffsetY: 10,
        timer: null,
      },
      graphicContext: {
        glContext: null,
        program: null,
        width: 100,
        height: 30,
        positionAttributeLocation: null,
        rotationLocation: null, 
        scaleLocation: null, 
        resolutionUniformLocation: null, 
        colorUniformLocation: null, 
        positionBuffer: null, 
      },
      transformation : {
        color: [Math.random(), Math.random(), Math.random(), 1],
        translation: [0, 0],
        rotationAngle: 0,
        scaleX: 1, 
        scaleY: 1,
      }
    };
  }

  //component render
  render() {
    return (
      <Container fluid className="p-3 MainRow">
        <Row className="MainRow">
          <Col xs={8} className="MainRow">
            <WebGLCanvas afterInit={ this.setGlContext.bind(this)}/>
          </Col>
          <Col>
            <>
              <div>{'translation offset x: ' + this.state.animationContext.translationOffsetX}</div>
              <Slider
                axis="x"
                xstep={1}
                xmin={1}
                xmax={20}
                x={this.state.animationContext.translationOffsetX}
                onChange={
                  ({ x }) => {
                    this.setState({
                      animationContext: {
                        ...this.state.animationContext,
                        translationOffsetX: x,
                      },
                    });
                  }
                }
              />
            </>
            <>
              <div>{'translation offset y: ' + this.state.animationContext.translationOffsetY}</div>
              <Slider
                axis="x"
                xstep={1}
                xmin={1}
                xmax={20}
                x={this.state.animationContext.translationOffsetY}
                onChange={
                  ({ x }) => {
                    this.setState({
                      animationContext: {
                        ...this.state.animationContext,
                        translationOffsetY: x,
                      },
                    });
                  }}
              />
            </>
            <>
              <div>{'scaleX: ' + this.state.transformation.scaleX}</div>
              <Slider
                axis="x"
                xstep={1}
                xmin={1}
                xmax={20}
                x={this.state.transformation.scaleX}
                onChange={
                  ({ x }) => {
                    this.setState({
                      transformation: {
                        ...this.state.transformation,
                        scaleX: x,
                      },
                    });
                  }}
              />
            </>
            <>
              <div>{'scaleY: ' + this.state.transformation.scaleY}</div>
              <Slider
                axis="x"
                xstep={1}
                xmin={1}
                xmax={20}
                x={this.state.transformation.scaleY}
                onChange={
                  ({ x }) => {
                    this.setState({
                      transformation: {
                        ...this.state.transformation,
                        scaleY: x,
                      },
                    });
                  }}
              />
            </>

            <div>
              rotation: 
                <div style={{display:'inline-block'}}>
                  <Knob 
                    onChange={this.changeRotationValue.bind(this)}
                    min={0} 
                    max={360} 
                    value={this.state.transformation.rotationAngle}
                  />
                </div>
              </div>
            <div>
              <Button onClick={() => this.handleAnimationClick()}>Start/Stop</Button>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  //handler for rotation value change
  changeRotationValue(rotationAngleDegree) {
    this.setState({
      transformation: {
        ...this.state.transformation,
        rotationAngle: rotationAngleDegree,
      },
    });
  }

  //animate bounce the shape against the borders
  animate() {
    if(this.state.transformation.translation[0] > this.state.graphicContext.width){
      this.setState({
        animationContext: {
          ...this.state.animationContext,
          translateDirectionX: false,
        }
      });
    } else if (this.state.transformation.translation[0] < 0){
      this.setState({
        animationContext: {
          ...this.state.animationContext,
          translateDirectionX: true,
        }
      });
    } 
    if(this.state.animationContext.translateDirectionX){
      this.state.transformation.translation[0] += this.state.animationContext.translationOffsetX;
    } else {
      this.state.transformation.translation[0] -= this.state.animationContext.translationOffsetX;
    }
    if(this.state.transformation.translation[1] > this.state.graphicContext.height){
      this.setState({
        animationContext: {
          ...this.state.animationContext,
          translateDirectionY: false,
        }
      });
    } else if (this.state.transformation.translation[1] < 0){
      this.setState({
        animationContext: {
          ...this.state.animationContext,
          translateDirectionY: true,
        }
      });
    } 
    if(this.state.animationContext.translateDirectionY){
      this.state.transformation.translation[1] += this.state.animationContext.translationOffsetY;
    } else {
      this.state.transformation.translation[1] -= this.state.animationContext.translationOffsetY;
    }
    this.drawScene(this.state.graphicContext, this.state.transformation);
  }

  // Draw a the scene.
  drawScene(graphicContext, transformation) {
    var gl = graphicContext.glContext;
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // Clear the canvas.
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Tell it to use our program (pair of shaders)
    gl.useProgram(graphicContext.program);
    // Turn on the attribute
    gl.enableVertexAttribArray(graphicContext.positionAttributeLocation);
    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, graphicContext.positionBuffer);
    // Setup a rectangle
    this.drawShape(gl);
    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        graphicContext.positionAttributeLocation, size, type, normalize, stride, offset);
    // Set the translation.
    gl.uniform2fv(graphicContext.translationLocation, transformation.translation);
    // Set the rotation.
    var rotationAngleRadian = transformation.rotationAngle * Math.PI / 180;
    gl.uniform2fv(graphicContext.rotationLocation, [Math.sin(rotationAngleRadian), Math.cos(rotationAngleRadian)]);
    // Set the scale.
    gl.uniform2fv(graphicContext.scaleLocation, [transformation.scaleX, transformation.scaleY]);
    // set the resolution
    gl.uniform2f(graphicContext.resolutionLocation, gl.canvas.width, gl.canvas.height);
    // set the color
    gl.uniform4fv(graphicContext.colorLocation, transformation.color);
    // Draw the rectangle.
    var primitiveType = gl.TRIANGLES;
    var count = 18;
    gl.drawArrays(primitiveType, offset, count);
  }

  // Returns a random integer from 0 to range - 1.
  randomInt(range) {
    return Math.floor(Math.random() * range);
  }

  //draw the shape
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

  //handle click on 'animate' button
  handleAnimationClick() {
    if(!this.state.animationContext.animationState){
      var newTimer = setInterval(this.animate.bind(this), 25);
      this.setState({
        animationContext: {
          ...this.state.animationContext,
          timer: newTimer,
          animationState: true,
        }
      });
    } else {
      clearInterval(this.state.animationContext.timer);
      this.setState({
        animationContext: {
          ...this.state.animationContext,
          timer: null,
          animationState: false,
        }
      });
    }
  }

  //set the WebGL context: this is called when ReactJS initialize the view
  setGlContext(glContext, width, height) {
    var vertexShaderSource = VertexShader;
    var fragmentShaderSource = FragmentShader;
    var vertexShader = this.createShader(glContext, glContext.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = this.createShader(glContext, glContext.FRAGMENT_SHADER, fragmentShaderSource);
    var program = this.createProgram(glContext, vertexShader, fragmentShader);
    var graphicContext = {...this.state.graphicContext}
    graphicContext.glContext= glContext; 
    graphicContext.width = width;
    graphicContext.height = height;
    graphicContext.program = program;
    graphicContext.positionAttributeLocation = glContext.getAttribLocation(program, "a_position");
    graphicContext.translationLocation = glContext.getUniformLocation(program, "u_translation");
    graphicContext.rotationLocation = glContext.getUniformLocation(program, "u_rotation");
    graphicContext.scaleLocation = glContext.getUniformLocation(program, "u_scale");
    graphicContext.resolutionLocation = glContext.getUniformLocation(program, "u_resolution");
    graphicContext.colorLocation = glContext.getUniformLocation(program, "u_color");
    graphicContext.positionBuffer = glContext.createBuffer();
    this.setState({graphicContext})
  }

  //create a WebGL shader
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

  //create a WebGL program
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
}

export default App;

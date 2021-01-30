import React from 'react';

class WebGLCanvas extends React.Component {

  constructor(props) {
    super(props);
    this.canvas = React.createRef();  
  }

  shouldComponentUpdate(nextProps, nextState){
    return false;
  }
  
  render() {
    return (
        <canvas id="c" width="100%" height="100%" ref={this.canvas}></canvas>
    );
  }

  componentDidMount() {
    this.canvas.current.height = this.canvas.current.parentElement.clientHeight;
    this.canvas.current.width = this.canvas.current.parentElement.clientWidth;
    this.glContext = this.canvas.current.getContext("webgl");
    this.canvas.current.tabIndex = 1000;
  }



}

export default WebGLCanvas;

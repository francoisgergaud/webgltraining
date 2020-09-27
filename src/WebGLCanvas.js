import React, { useState } from 'react';
import ReactDOM from "react-dom";
import $ from 'jquery'; 

class WebGLCanvas extends React.Component {

  constructor(props) {
    super(props);
    this.canvas = React.createRef();  
    this.state = {
      initialized:false,
    }
  }

  shouldComponentUpdate(nextProps, nextState){
    return !this.state.initialized
  }
  
  render() {
    this.state.initialized = true;
    return (
        <canvas id="c" width="100%" height="100%" ref={this.canvas}></canvas>
    );
  }

  componentDidMount() {
    //var $canvas = $(ReactDOM.findDOMNode(this));
    this.canvas.current.height = this.canvas.current.parentElement.clientHeight;
    this.canvas.current.width = this.canvas.current.parentElement.clientWidth;
    var glContext = this.canvas.current.getContext("webgl");
    this.props.afterInit(glContext, this.canvas.current.width, this.canvas.current.height);
    //this.props.canvasHeight = $this.height();
    //this.props.canvasWidth = $this.width();
  }

}

export default WebGLCanvas;

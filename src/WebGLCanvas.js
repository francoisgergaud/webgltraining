import React from 'react';

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
    this.setState({initialized : true});
    return (
        <canvas id="c" width="100%" height="100%" ref={this.canvas}></canvas>
    );
  }

  componentDidMount() {
    this.canvas.current.height = this.canvas.current.parentElement.clientHeight;
    this.canvas.current.width = this.canvas.current.parentElement.clientWidth;
    var glContext = this.canvas.current.getContext("webgl");
    this.canvas.current.tabIndex = 1000;
    this.props.afterInit(glContext, this.canvas.current);
  }

}

export default WebGLCanvas;

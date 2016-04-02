import React, { Component } from 'react'

export default class Element extends Component {

  constructor() {
    super();
    this.state = {x : 50, y : 50, inMove: false, selected: false};
  }
  
  componentWillMount (){
    this.state = {x : this.props.x, y : this.props.y, selected: this.props.selected}; 
  }

  componentWillReceiveProps( nextProps ) {
    //console.log('=== nextProps.inMove', nextProps.inMove);
    if(this.state.inMove && nextProps.inMove){
      this.setState({x : nextProps.mouseX, y : nextProps.mouseY, id: nextProps.id})
    }
    
    if(this.state.inMove && !nextProps.inMove){
      this.setState({inMove: false})
      // this.props.onChangeCoord(this.props.id,  this.state.x, this.state.y);
    }

    //if(this.state.selected && !nextProps.selected)
      this.setState({selected: nextProps.selected})
  }  

  shouldComponentUpdate(nextProps, nextState) {
    //console.log(this.state);
    var update = nextProps.x != this.state.x || nextProps.y != this.state.y || nextState.inMove != this.state.inMove || nextState.selected != this.state.selected;
    if(update)  this.props.onChangeCoord(this.props.id,  this.state.x, this.state.y);

    return update;
  }

  handler(e){
    console.log('click on circle', this.props.id);
    e.stopPropagation();
  }

  // handlerMove(e){
  //   this.setState({x : e.clientX, y : e.clientY});
  // }

  mouseDown(){
    console.log('=== mouseDown');
    this.props.onSelect(this.props.id);
    this.setState({inMove: true});
  }

  mouseUp(){
    console.log('=== mouseUp');
    this.setState({inMove: false}); 
  }
  
  render() {
    //console.log('=== render', this.state, 'selected: ',this.props.selected);
    var color = this.props.selected ? 'blue' : 'red';
    return (
      <svg>
        <circle cx={this.state.x} cy={this.state.y} r={15} fill={color} onClick={::this.handler} onMouseDown={::this.mouseDown} onMouseUp={::this.mouseUp}/>
        <text fill={'white'} x={this.state.x-8} y={this.state.y+5}>{this.props.id}</text>
      </svg>
    )
  }

}

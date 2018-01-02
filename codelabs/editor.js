class Dragable{
  constructor(element,offset){
    this.element = element
    this.offset = offset
    // this.initDrag(this)
  }
  initDrag(self){
     this.element.drag(
        function(dx, dy, x, y,event){
            //  dx = abs(startX - x) ,ditto dy .
            self.drag(dx,dy,x - self.offset.left,y - self.offset.top)
        },
        function(x,y){
            self.startDrag(x - self.offset.left,y - self.offset.top)
        }
        ,
        function(){
          self.stopDrag()
        }
      )
  }
  drag(dx,dy,x,y){}
  stopDrag(){}
  startDrag(x,y){}
}
class NewShapeBg extends Dragable{
   constructor(editor,offset, width, height){
      var newShapeBackground = editor.makeRect(0, 0, width, height);
      super(newShapeBackground,offset)

      this.editor = editor
      this.offset = offset
      this.SelectState = true
      this.newShapeBackground = newShapeBackground
      self = this
      this.newShapeBackground.attr({'fill':'#00a',
                            'fill-opacity':0.3,
                            'stroke-width': 1,
                            'cursor': 'default'});
      this.newShapeBackground.toFront()
      this.initDrag(this)
  }
  toBack(){
    this.element.toBack()
  }
  drag(dx,dy,x,y){
    if (!this.editor.isSelectedState()){
      this.rect.setCoords(this.startX,this.startY,x,y)
    }
  }
  stopDrag(){
    if (!this.editor.isSelectedState()){
      var coords = this.rect.getCoords();
      if (coords.width < 2 || coords.height < 2) {
        this.rect.destroy();
        delete this.rect;
        return;
      }
    }
  }
  startDrag(x,y){
    if (!this.editor.isSelectedState()){
      this.rect = new Rect(this.editor,x,y,0,0);
      this.newShapeBackground.toFront()
      this.startX = x
      this.startY = y
    }
  }
}
class Editor{
  constructor(paper){
    var elementId = paper.elementId, width=paper.width, height = paper.height
    self = this
    this.paper = paper.paper
    

    this.offset = paper.offset
    this.newShapeBg = new NewShapeBg(this,this.offset, width, height)
    this.rect = new Rect(this,100,100,100,100)
    this.setState("select")
  }
  setState(state){
    this.state = state
    if (this.isSelectedState()){
      this.newShapeBg.toBack()
    }
  }
  isSelectedState(){
    return this.state === "select"
  }
  makeRect(x,y,width,height){
    return this.paper.rect(x,y,width,height)
  }
  rectByCenter(x,y,width,height){
      return this.paper.rect(x - width/2,y - height/2,width,height)
  }  
} 
class Rect extends Dragable{
  constructor(editor,x,y,width,height){
    var element = editor.makeRect();
    super(element,editor.offset)
    this.handleSize = 8
    this.editor = editor
    this.offset = editor.offset
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
    this._strokeColor =  "red"
    this._strokeWidth =  2;
    this._selected = false;
    this.element = element
    this.element.attr({'fill-opacity': 0.01,
                       'fill': '#fff',
                       'cursor': 'pointer'});
    this.handles = new Handles(this.editor)
    this.drawShape()
    var self = this
    this.initDrag(this)
  }
  drag(dx,dy,x,y){

  }
  stopDrag(){

  }

  startDrag(x,y){
    this.isSelected = !this.isSelected
    this.handles.drawHandles(this._x,this._y,this._width,this._height)
    this.drawShape()
  }
  
  drawShape() {
    var x = this._x ,
        y = this._y ,
        w = this._width ,
        h = this._height ;
    this.element.attr({'x':x, 'y':y,
                       'width':w, 'height':h,
                       'stroke': this._strokeColor,
                       'stroke-width': this._strokeWidth});
    this.handles.show(this.isSelected)
  }
  setCoords(x1,y1,x2,y2) {
    var coords = {'x': Math.min(x1, x2),
                        'y': Math.min(y1, y2),
                        'width': Math.abs(x1 - x2), 'height': Math.abs(y1 - y2)}
    this.setCoordsInner(coords)
  }
  setCoordsInner(coords) {
    this._x = coords.x || this._x;
    this._y = coords.y || this._y;
    this._width = coords.width || this._width;
    this._height = coords.height || this._height;
    this.drawShape();
  }
  getCoords(){
    return {'x': this._x,
            'y': this._y,
            'width': this._width,
            'height': this._height};
  }
  destroy() {
    this.element.remove();
  };
}
class Handles{
  constructor(editor){
    this.editor = editor
    this.handles = []
    this.handleSize = 8
  }
  drawHandles(x,y,width,height){
    var resultxys = this.HandlesCords (x,y,width,height)
    for (var i = 0; i < resultxys.length; i++) {
      var x = resultxys[i][0]
      var y = resultxys[i][1]
      this.handles.push(this.makeHandle(x,y)) 
    }
  }
  makeHandle(x,y){
    return this.editor.rectByCenter(x, y, this.handleSize, this.handleSize);
  }
  HandlesCords(x,y,width,height){
    var xs = [x,x + width/2,x+width]
    var ys = [y,y + height/2,y+height]
    var resultxys = []
    for (var i = 0; i < xs.length; i++) {
      for (var j = 0; j < ys.length; j++) {
        if (i != 1 || j != 1)
          resultxys.push([xs[i],ys[j]])
      }
    }
    return resultxys
  }
  show(isSelected){
     for (var i = 0; i < this.handles.length; i++) {
        var handle = this.handles[i]
         if(isSelected){
           handle.show()
        }else{
           handle.hide()
        }
      }
  }
}
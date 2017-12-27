class NewShapeBg{
   constructor(paper,offset, width, height){
      self = this
      this.paper = paper
      this.offset = offset
      this.newShapeBackground = this.paper.rect(0, 0, width, height);
      this.newShapeBackground.attr({'fill':'#00a',
                            'fill-opacity':0.3,
                            'stroke-width': 1,
                            'cursor': 'default'});
      this.newShapeBackground.drag(
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
  drag(dx,dy,x,y){
    this.rect.setCoords(this.startX,this.startY,x,y)
  }
  stopDrag(){
    var coords = this.rect.getCoords();
    if (coords.width < 2 || coords.height < 2) {
      this.rect.destroy();
      delete this.rect;
      return;
    }
  }
  startDrag(x,y){
    this.rect = new Rect({
        'paper': this.paper,
        'x': x,
        'y': y,
        'width': 0,
        'height': 0});
    this.newShapeBackground.toFront()
    this.startX = x
    this.startY = y
  }
}

class Editor{
  constructor(Raphael,elementId, width, height){
    self = this
    this.paper = Raphael(elementId, width, height);
    this.$el = $("#" + elementId);
    this.offset = self.$el.offset(),
    this.newShapeBg = new NewShapeBg(this.paper,this.offset, width, height)
  }
  
} 

class Rect{
  constructor(options){
    var self = this;
    this.paper = options.paper;
    
    this._x = options.x;
    this._y = options.y;
    this._width = options.width;
    this._height = options.height;
    this._strokeColor = options.strokeColor || "red"
    this._strokeWidth = options.strokeWidth || 2;
    this._selected = false;
    this.element = this.paper.rect();
    this.element.attr({'fill-opacity': 0.01,
                       'fill': '#fff',
                       'cursor': 'pointer'});
    this.drawShape();
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

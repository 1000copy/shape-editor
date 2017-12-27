class Editor{
  constructor(Raphael,elementId, width, height){
    self = this
    this.paper = Raphael(elementId, width, height);
    this.$el = $("#" + elementId);
    this.offset = self.$el.offset(),
    this.newShapeBg = this.paper.rect(0, 0, width, height);
    this.newShapeBg.attr({'fill':'#00a',
                          'fill-opacity':0.3,
                          'stroke-width': 1,
                          'cursor': 'default'});
    this.newShapeBg.drag(
      function(dx, dy, x, y,event){
          self.drag(dx,dy,x,y)
      },
      function(x,y){
          self.startDrag(x,y)
      }
      ,
      function(){
          
      }
    )
  }
  drag(dx,dy,x,y){
    var dragX = x - this.offset.left,
        dragY = y - this.offset.top;
    this.rect.setCoords({'x': Math.min(dragX, this.startX),
                        'y': Math.min(dragY, this.startY),
                        'width': Math.abs(dx), 'height': Math.abs(dy)});
  }
  startDrag(x,y){
    this.startX = x - self.offset.left,
    this.startY = y - self.offset.top;
    this.rect = new Rect({
        'paper': this.paper,
        'x': this.startX,
        'y': this.startY,
        'width': 0,
        'height': 0});
    this.newShapeBg.toFront()
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
  setCoords(coords) {
    this._x = coords.x || this._x;
    this._y = coords.y || this._y;
    this._width = coords.width || this._width;
    this._height = coords.height || this._height;
    this.drawShape();
  }
}

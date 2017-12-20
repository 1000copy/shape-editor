var Rect = function Rect(options) {
    var self = this;
    this.paper = options.paper;
    this.manager = options.manager;

    if (options.id) {
        this._id = options.id;
    } else {
        this._id = this.manager.getRandomId();
    }
    this._x = options.x;
    this._y = options.y;
    this._width = options.width;
    this._height = options.height;
    this._strokeColor = options.strokeColor;
    this._strokeWidth = options.strokeWidth || 2;
    this._selected = false;
    this._zoomFraction = 1;
    if (options.zoom) {
        this._zoomFraction = options.zoom / 100;
    }
    this.element = this.paper.rect();
    this.element.attr({'fill-opacity': 0.01,
                       'fill': '#fff',
                       'cursor': 'pointer'});

    if (this.manager.canEdit) {
        // Drag handling of element
        this.element.drag(
            function(dx, dy) {
                // DRAG, update location and redraw
                dx = dx / self._zoomFraction;
                dy = dy / self._zoomFraction;

                var offsetX = dx - this.prevX;
                var offsetY = dy - this.prevY;
                this.prevX = dx;
                this.prevY = dy;

                // Manager handles move and redraw
                self.manager.moveSelectedShapes(offsetX, offsetY, true);
            },
            function() {
                self._handleMousedown();
                this.prevX = 0;
                this.prevY = 0;
                return false;
            },
            function() {
                // STOP
                // notify manager if rectangle has moved
                if (this.prevX !== 0 || this.prevY !== 0) {
                    // self.manager.notifySelectedShapesChanged();
                }
                return false;
            }
        );
    }
    this.drawShape();
};

Rect.prototype.toJson = function toJson() {
    var rv = {
        'type': 'Rectangle',
        'x': this._x,
        'y': this._y,
        'width': this._width,
        'height': this._height,
        'strokeWidth': this._strokeWidth,
        'strokeColor': this._strokeColor
    };
    if (this._id) {
        rv.id = this._id;
    }
    return rv;
};

// Does this intersect a 'region' as defined by MODEL coords (not zoom dependent)
Rect.prototype.intersectRegion = function intersectRegion(region) {
    var path = this.manager.regionToPath(region, this._zoomFraction * 100);
    var f = this._zoomFraction,
        x = parseInt(this._x * f, 10),
        y = parseInt(this._y * f, 10);
    
    if (Raphael.isPointInsidePath(path, x, y)) {
        return true;
    }
    var path2 = this.getPath(),
        i = Raphael.pathIntersection(path, path2);
    return (i.length > 0);
};

// Useful for testing intersection of paths
Rect.prototype.getPath = function getPath() {

    var f = this._zoomFraction,
        x = parseInt(this._x * f, 10),
        y = parseInt(this._y * f, 10),
        width = parseInt(this._width * f, 10),
        height = parseInt(this._height * f, 10);

    var cornerPoints = [
                [x, y],
                [x + width, y],
                [x + width, y + height],
                [x, y + height]
            ];
    var path = [];
    for (var i = 0; i <= 3; i++) {
        if (i === 0) {
            path.push("M" + cornerPoints[0].join(","));
        }
        if (i < 3) {
            path.push("L" + cornerPoints[i + 1].join(","));
        } else {
            path.push("Z");
        }
    }
    return path.join(",");
};

Rect.prototype.compareCoords = function compareCoords(json) {
    if (json.type !== "Rectangle") {
        return false;
    }
    var selfJson = this.toJson(),
        match = true;
    ['x', 'y', 'width', 'height'].forEach(function(c){
        if (json[c] !== selfJson[c]) {
            match = false;
        }
    });
    return match;
};

// Useful for pasting json with an offset
Rect.prototype.offsetCoords = function offsetCoords(json, dx, dy) {
    json.x = json.x + dx;
    json.y = json.y + dy;
    return json;
};

// Shift this shape by dx and dy
Rect.prototype.offsetShape = function offsetShape(dx, dy) {
    this._x = this._x + dx;
    this._y = this._y + dy;
    this.drawShape();
};

// handle start of drag by selecting this shape
// if not already selected
Rect.prototype._handleMousedown = function _handleMousedown() {
    if (!this._selected) {
        this.manager.selectShapes([this]);
    }
};

Rect.prototype.setSelected = function setSelected(selected) {
    this._selected = !!selected;
    this.drawShape();
};

Rect.prototype.isSelected = function isSelected() {
    return this._selected;
};

Rect.prototype.setZoom = function setZoom(zoom) {
    this._zoomFraction = zoom / 100;
    this.drawShape();
};

Rect.prototype.setCoords = function setCoords(coords) {
    this._x = coords.x || this._x;
    this._y = coords.y || this._y;
    this._width = coords.width || this._width;
    this._height = coords.height || this._height;
    this.drawShape();
};

Rect.prototype.getCoords = function getCoords() {
    return {'x': this._x,
            'y': this._y,
            'width': this._width,
            'height': this._height};
};

Rect.prototype.setStrokeColor = function setStrokeColor(strokeColor) {
    this._strokeColor = strokeColor;
    this.drawShape();
};

Rect.prototype.getStrokeColor = function getStrokeColor() {
    return this._strokeColor;
};

Rect.prototype.setStrokeWidth = function setStrokeWidth(strokeWidth) {
    this._strokeWidth = strokeWidth;
    this.drawShape();
};

Rect.prototype.getStrokeWidth = function getStrokeWidth() {
    return this._strokeWidth;
};

Rect.prototype.destroy = function destroy() {
    this.element.remove();
};

Rect.prototype.drawShape = function drawShape() {

    var strokeColor = this._strokeColor,
        lineW = this._strokeWidth * this._zoomFraction;

    var f = this._zoomFraction,
        x = this._x * f,
        y = this._y * f,
        w = this._width * f,
        h = this._height * f;

    this.element.attr({'x':x, 'y':y,
                       'width':w, 'height':h,
                       'stroke': strokeColor,
                       'stroke-width': lineW});

    if (this.isSelected()) {
        this.element.toFront();
    }
};
var CreateRect = function CreateRect(options) {

    this.paper = options.paper;
    this.manager = options.manager;
};

CreateRect.prototype.startDrag = function startDrag(startX, startY) {

    var strokeColor = this.manager.getStrokeColor(),
        strokeWidth = this.manager.getStrokeWidth(),
        zoom = this.manager.getZoom();
    // Also need to get strokeWidth and zoom/size etc.

    this.startX = startX;
    this.startY = startY;

    this.rect = new Rect({
        'manager': this.manager,
        'paper': this.paper,
        'x': startX,
        'y': startY,
        'width': 0,
        'height': 0,
        'strokeWidth': strokeWidth,
        'zoom': zoom,
        'strokeColor': strokeColor});
};

CreateRect.prototype.drag = function drag(dragX, dragY, shiftKey) {

    var dx = this.startX - dragX,
        dy = this.startY - dragY;

    // if shiftKey, constrain to a square
    if (shiftKey) {
        if (dx * dy > 0) {
            if (Math.abs(dx/dy) > 1) {
                dy = dx;
            } else {
                dx = dy;
            }
        } else {
            if (Math.abs(dx/dy) > 1) {
                dy = -dx;
            } else {
                dx = -dy;
            }
        }
        dragX = (dx - this.startX) * -1;
        dragY = (dy - this.startY) * -1;
    }

    this.rect.setCoords({'x': Math.min(dragX, this.startX),
                        'y': Math.min(dragY, this.startY),
                        'width': Math.abs(dx), 'height': Math.abs(dy)});
};

CreateRect.prototype.stopDrag = function stopDrag() {

    var coords = this.rect.getCoords();
    if (coords.width < 2 || coords.height < 2) {
        this.rect.destroy();
        delete this.rect;
        return;
    }
    // on the 'new:shape' trigger, this shape will already be selected
    this.rect.setSelected(true);
    this.manager.addShape(this.rect);
};

var ShapeManager = function ShapeManager(elementId, width, height, options) {

    var self = this;
    options = options || {};

    // Keep track of state, strokeColor etc
    this.STATES = ["SELECT", "RECT", "LINE", "ARROW", "ELLIPSE"];
    this._state = "SELECT";
    this._strokeColor = "#ff0000";
    this._strokeWidth = 2;
    this._orig_width = width;
    this._orig_height = height;
    this._zoom = 100;
    // Don't allow editing of shapes - no drag/click events
    this.canEdit = !options.readOnly;

    // Set up Raphael paper...
    this.paper = Raphael(elementId, width, height);

    // jQuery element used for .offset() etc.
    this.$el = $("#" + elementId);

    // Store all the shapes we create
    this._shapes = [];

    // Add a full-size background to cover existing shapes while
    // we're creating new shapes, to stop them being selected.
    // Mouse events on this will bubble up to svg and are handled below
    this.newShapeBg = this.paper.rect(0, 0, width, height);
    this.newShapeBg.attr({'fill':'#000',
                          'fill-opacity':0.01,
                          'stroke-width': 1,
                          'cursor': 'default'});
    this.selectRegion = this.paper.rect(0, 0, width, height);
    this.selectRegion.hide().attr({'stroke': '#ddd',
                                   'stroke-width': 1,
                                   'stroke-dasharray': '- '});
    if (this.canEdit) {
        this.newShapeBg.drag(
            function(){
                self.drag.apply(self, arguments);
            },
            function(){
                self.startDrag.apply(self, arguments);
            },
            function(){
                self.stopDrag.apply(self, arguments);
            });

        this.shapeFactories = {
            "RECT": new CreateRect({'manager': this, 'paper': this.paper}),
        };

        this.createShape = this.shapeFactories.LINE;
    } else {
        this.shapeFactories = {};
    }
};

ShapeManager.prototype.startDrag = function startDrag(x, y, event){
    // clear any existing selected shapes
    this.clearSelectedShapes();

    var offset = this.$el.offset(),
        startX = x - offset.left,
        startY = y - offset.top;

    if (this.getState() === "SELECT") {

        this._dragStart = {x: startX, y: startY};

        this.selectRegion.attr({'x': startX,
                                'y': startY,
                                'width': 0,
                                'height': 0});
        this.selectRegion.toFront().show();

    } else {
        // create a new shape with X and Y
        // createShape helper can get other details itself

        // correct for zoom before passing coordinates to shape
        var zoomFraction = this._zoom / 100;
        startX = startX / zoomFraction;
        startY = startY / zoomFraction;
        this.createShape.startDrag(startX, startY);
    }

    // Move this in front of new shape so that drag events don't get lost to the new shape
    this.newShapeBg.toFront();
};

ShapeManager.prototype.drag = function drag(dx, dy, x, y, event){
    var offset = this.$el.offset(),
        dragX = x - offset.left,
        dragY = y - offset.top;

    if (this.getState() === "SELECT") {

        dx = this._dragStart.x - dragX,
        dy = this._dragStart.y - dragY;

        this.selectRegion.attr({'x': Math.min(dragX, this._dragStart.x),
                                'y': Math.min(dragY, this._dragStart.y),
                                'width': Math.abs(dx),
                                'height': Math.abs(dy)});
    } else {

        // correct for zoom before passing coordinates to shape
        var zoomFraction = this._zoom / 100,
            shiftKey = event.shiftKey;
        dragX = dragX / zoomFraction;
        dragY = dragY / zoomFraction;
        this.createShape.drag(dragX, dragY, shiftKey);
    }
};

ShapeManager.prototype.stopDrag = function stopDrag(){
    if (this.getState() === "SELECT") {

        // need to get MODEL coords (correct for zoom)
        var region = this.selectRegion.attr(),
            f = this._zoom/100,
            x = region.x / f,
            y = region.y / f,
            width = region.width / f,
            height = region.height / f;
        this.selectShapesByRegion({x: x, y: y, width: width, height: height});

        // Hide region and move drag listening element to back again.
        this.selectRegion.hide();
        this.newShapeBg.toBack();
    } else {
        this.createShape.stopDrag();
    }
};

ShapeManager.prototype.setState = function setState(state) {
    if (this.STATES.indexOf(state) === -1) {
        console.log("Invalid state: ", state, "Needs to be in", this.STATES);
        return;
    }
    // When creating shapes, cover existing shapes with newShapeBg
    var shapes = ["RECT", "LINE", "ARROW", "ELLIPSE"];
    if (shapes.indexOf(state) > -1) {
        this.newShapeBg.toFront();
        this.newShapeBg.attr({'cursor': 'crosshair'});
        // clear selected shapes
        this.clearSelectedShapes();

        if (this.shapeFactories[state]) {
            this.createShape = this.shapeFactories[state];
        }
    } else if (state === "SELECT") {
        // Used to handle drag-select events
        this.newShapeBg.toBack();
        this.newShapeBg.attr({'cursor': 'default'});
    }

    this._state = state;
};

ShapeManager.prototype.getState = function getState() {
    return this._state;
};

ShapeManager.prototype.setZoom = function setZoom(zoomPercent) {
    this._zoom = zoomPercent;
    var width = this._orig_width * zoomPercent / 100,
        height = this._orig_height * zoomPercent / 100;
    this.paper.setSize(width, height);
    this.paper.canvas.setAttribute("viewBox", "0 0 "+width+" "+height);
    this.newShapeBg.attr({'width': width, 'height': height});

    // zoom the shapes
    this._shapes.forEach(function(shape){
        shape.setZoom(zoomPercent);
    });
};

ShapeManager.prototype.getZoom = function getZoom(zoomPercent) {
    return this._zoom;
};

ShapeManager.prototype.setStrokeColor = function setStrokeColor(strokeColor) {
    this._strokeColor = strokeColor;
    var selected = this.getSelectedShapes();
    for (var s=0; s<selected.length; s++) {
        selected[s].setStrokeColor(strokeColor);
    }
};

ShapeManager.prototype.getStrokeColor = function getStrokeColor() {
    return this._strokeColor;
};

ShapeManager.prototype.setStrokeWidth = function setStrokeWidth(strokeWidth) {
    strokeWidth = parseInt(strokeWidth, 10);
    this._strokeWidth = strokeWidth;
    var selected = this.getSelectedShapes();
    for (var s=0; s<selected.length; s++) {
        selected[s].setStrokeWidth(strokeWidth);
    }
};

ShapeManager.prototype.getStrokeWidth = function getStrokeWidth() {
    return this._strokeWidth;
};



ShapeManager.prototype.regionToPath = function regionToPath(region, zoom) {
    var f = zoom ? zoom/100: this._zoom/100,
        x = parseInt(region.x * f, 10),
        y = parseInt(region.y * f, 10),
        width = parseInt(region.width * f, 10),
        height = parseInt(region.height * f, 10);

    return [["M" + x + "," + y],
                ["L" + (x + width) + "," + y],
                ["L" + (x + width) + "," + (y + height)],
                ["L" + x + "," + (y + height) + "Z"]
            ].join(",");
};





// Create and add a json shape object
// Use constrainRegion {x, y, width, height} to enforce if it's in the specified region
// constrainRegion = true will use the whole image plane
// Return false if shape didn't get created
ShapeManager.prototype.addShapeJson = function addShapeJson(jsonShape, constrainRegion) {
    var newShape = this.createShapeJson(jsonShape);
    if (!newShape) {
        return;
    }
    if (constrainRegion) {
        if (typeof constrainRegion === "boolean") {
            constrainRegion = {x: 0, y: 0, width: this._orig_width, height: this._orig_height};
        }
        if (!newShape.intersectRegion(constrainRegion)) {
            newShape.destroy();
            return false;
        }
    }
    this._shapes.push(newShape);
    return newShape;
};

// Create a Shape object from json
ShapeManager.prototype.createShapeJson = function createShapeJson(jsonShape) {
    var s = jsonShape,
        newShape,
        strokeColor = s.strokeColor || this.getStrokeColor(),
        strokeWidth = s.strokeWidth || this.getStrokeWidth(),
        zoom = this.getZoom(),
        options = {'manager': this,
                   'paper': this.paper,
                   'strokeWidth': strokeWidth,
                   'zoom': zoom,
                   'strokeColor': strokeColor};
    if (jsonShape.id) {
        options.id = jsonShape.id;
    }

    if (s.type === 'Ellipse') {
        options.x = s.x;
        options.y = s.y;
        options.radiusX = s.radiusX;
        options.radiusY = s.radiusY;
        options.rotation = s.rotation || 0;
        options.transform = s.transform;
        newShape = new Ellipse(options);
    }
    else if (s.type === 'Rectangle') {
        options.x = s.x;
        options.y = s.y;
        options.width = s.width;
        options.height = s.height;
        newShape = new Rect(options);
    }
    else if (s.type === 'Line') {
        options.x1 = s.x1;
        options.y1 = s.y1;
        options.x2 = s.x2;
        options.y2 = s.y2;
        newShape = new Line(options);
    }
    else if (s.type === 'Arrow') {
        options.x1 = s.x1;
        options.y1 = s.y1;
        options.x2 = s.x2;
        options.y2 = s.y2;
        newShape = new Arrow(options);
    }
    return newShape;
};

// Add a shape object
ShapeManager.prototype.addShape = function addShape(shape) {
    this._shapes.push(shape);
    this.$el.trigger("new:shape", [shape]);
};

ShapeManager.prototype.getShapes = function getShapes() {
    return this._shapes;
};

ShapeManager.prototype.getShape = function getShape(shapeId) {
    var shapes = this.getShapes();
    for (var i=0; i<shapes.length; i++) {
        if (shapes[i]._id === shapeId) {
            return shapes[i];
        }
    }
};

ShapeManager.prototype.getSelectedShapes = function getSelectedShapes() {
    var selected = [],
        shapes = this.getShapes();
    for (var i=0; i<shapes.length; i++) {
        if (shapes[i].isSelected()) {
            selected.push(shapes[i]);
        }
    }
    return selected;
};

// Shift all selected shapes by x and y
// E.g. while dragging multiple shapes
ShapeManager.prototype.moveSelectedShapes = function moveSelectedShapes(dx, dy, silent) {
    this.getSelectedShapes().forEach(function(shape){
        shape.offsetShape(dx, dy);
    });
};

ShapeManager.prototype.deleteAllShapes = function deleteAllShapes() {
    this.getShapes().forEach(function(s) {
        s.destroy();
    });
    this._shapes = [];
    this.$el.trigger("change:selected");
};

ShapeManager.prototype.deleteShapesByIds = function deleteShapesByIds(shapeIds) {
    var notSelected = [];
    this.getShapes().forEach(function(s) {
        if (shapeIds.indexOf(s._id) > -1) {
            s.destroy();
        } else {
            notSelected.push(s);
        }
    });
    this._shapes = notSelected;
    this.$el.trigger("change:selected");
};

ShapeManager.prototype.deleteSelectedShapes = function deleteSelectedShapes() {
    var notSelected = [];
    this.getShapes().forEach(function(s) {
        if (s.isSelected()) {
            s.destroy();
        } else {
            notSelected.push(s);
        }
    });
    this._shapes = notSelected;
    this.$el.trigger("change:selected");
};

ShapeManager.prototype.selectShapesById = function selectShapesById(shapeId) {

    // Clear selected with silent:true, since we notify again below
    this.clearSelectedShapes(true);
    var toSelect = [];
    this.getShapes().forEach(function(shape){
        if (shape.toJson().id === shapeId) {
            toSelect.push(shape);
        }
    });
    this.selectShapes(toSelect);
};

ShapeManager.prototype.clearSelectedShapes = function clearSelectedShapes(silent) {
    for (var i=0; i<this._shapes.length; i++) {
        this._shapes[i].setSelected(false);
    }
    if (!silent) {
        this.$el.trigger("change:selected");
    }
};

ShapeManager.prototype.selectShapesByRegion = function selectShapesByRegion(region) {

    // Clear selected with silent:true, since we notify again below
    this.clearSelectedShapes(true);

    var toSelect = [];
    this.getShapes().forEach(function(shape){
        if (shape.intersectRegion(region)) {
            toSelect.push(shape);
        }
    });
    this.selectShapes(toSelect);
};

ShapeManager.prototype.selectAllShapes = function selectAllShapes(region) {
    this.selectShapes(this.getShapes());
};

// select shapes: 'shape' can be shape object or ID
ShapeManager.prototype.selectShapes = function selectShapes(shapes) {

    var strokeColor,
        strokeWidth;

    // Clear selected with silent:true, since we notify again below
    this.clearSelectedShapes(true);

    // Each shape, set selected and get color & stroke width...
    shapes.forEach(function(shape, i){
        if (typeof shape === "number") {
            shape = this.getShape(shape);
        }
        if (shape) {
            // for first shape, pick color
            if (strokeColor === undefined) {
                strokeColor = shape.getStrokeColor();
            } else {
                // for subsequent shapes, if colors don't match - set false
                if (strokeColor !== shape.getStrokeColor()) {
                    strokeColor = false;
                }
            }
            // for first shape, pick strokeWidth
            if (strokeWidth === undefined) {
                strokeWidth = shape.getStrokeWidth();
            } else {
                // for subsequent shapes, if colors don't match - set false
                if (strokeWidth !== shape.getStrokeWidth()) {
                    strokeWidth = false;
                }
            }
            shape.setSelected(true);
        }
    });
    if (strokeColor) {
        this._strokeColor = strokeColor;
    }
    if (strokeWidth) {
        this._strokeWidth = strokeWidth;
    }
    this.$el.trigger("change:selected");
};

ShapeManager.prototype.notifySelectedShapesChanged = function notifySelectedShapesChanged() {
    this.notifyShapesChanged(this.getSelectedShapes());
};

ShapeManager.prototype.notifyShapesChanged = function notifyShapesChanged(shapes) {
    this.$el.trigger("change:shape", [shapes]);
};

ShapeManager.prototype.getRandomId = function getRandomId() {
    // returns a random integer we can use for id
    // NB - we use negative numbers to distinguish from server-side IDs
    var rndString = Math.random() + "";     // E.g. 0.7158358106389642
    return -parseInt(rndString.slice(2), 10);    // -7158358106389642
};

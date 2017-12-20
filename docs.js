$(function() {

    var WIDTH = 512,
        HEIGHT = 512;

    var options = {};

    var shapesClipboard = [];

    // We can choose to display shapes only - No editing
    // options = {'readOnly': true};
    // var w = document.getElementById("shapesCanvas").offsetWidth
    // var h = document.getElementById("shapesCanvas").offsetHeight
    // WIDTH = w
    // HEIGHT = h
    // console.log(w,h)
    var shapeManager = new ShapeManager("shapesCanvas",
                                        WIDTH, HEIGHT,
                                        options);

    var zoomPercent = 100;

    // set state depending on what we want to do,
    // for example to create Rectangle

    $("input[name='state']").click(function(){
        var state = $(this).val();
        shapeManager.setState(state);
    });

    $("input[name='strokeColor']").click(function(){
        var strokeColor = $(this).val();
        shapeManager.setStrokeColor(strokeColor);
    });

    $("select[name='strokeWidth']").change(function(){
        var strokeWidth = $(this).val();
        shapeManager.setStrokeWidth(strokeWidth);
    });

    var updateZoom = function updateZoom() {
        $("#zoomDisplay").text(zoomPercent + " %");
        shapeManager.setZoom(zoomPercent);
        var w = WIDTH * zoomPercent / 100,
            h = HEIGHT * zoomPercent / 100;
        $(".imageWrapper img").css({'width': w, 'height': h});
    };

    $("button[name='zoomIn']").click(function(){
        zoomPercent += 20;
        updateZoom();
    });
    $("button[name='zoomOut']").click(function(){
        zoomPercent -= 20;
        updateZoom();
    });

    $("button[name='deleteSelected']").click(function(){
        shapeManager.deleteSelectedShapes();
    });

    $("button[name='deleteAll']").click(function(){
        shapeManager.deleteAllShapes();
    });

    $("button[name='selectAll']").click(function(){
        shapeManager.selectAllShapes();
    });

    $("button[name='copyShapes']").click(function(){
        shapesClipboard = shapeManager.getSelectedShapesJson();
    });

    $("button[name='pasteShapes']").click(function(){
        // paste shapes, constraining to the image coords
        var p = shapeManager.pasteShapesJson(shapesClipboard, true);
        if (!p) {
            console.log("Shape could not be pasted: outside view port");
        }
    });

    $("button[name='getShapes']").click(function(){
      var json = shapeManager.getShapesJson();
      console.log(json);
    });

    $("button[name='getBBoxes']").click(function(){
      var shapes = shapeManager.getShapesJson();
      shapes.forEach(function(shape){
        var bbox = shapeManager.getShapeBoundingBox(shape.id);
        // Add each bbox as a Rectangle to image
        bbox.type = "Rectangle";
        bbox.strokeColor = "#ffffff";
        shapeManager.addShapeJson(bbox);
      });
    });

    $("button[name='selectShape']").click(function(){
      shapeManager.selectShapesById(1234);
    });

    var lastShapeId;
    $("button[name='deleteShapesByIds']").click(function(){
      shapeManager.deleteShapesByIds([lastShapeId]);
    });

    $("button[name='setShapes']").click(function(){
        var shapesJson = [
          {"type": "Rectangle",
            "strokeColor": "#ff00ff",
            "strokeWidth": 10,
            "x": 100, "y": 250,
            "width": 325, "height": 250},
          {"type": "Ellipse",
            "x": 300, "y": 250,
            "radiusX": 125, "radiusY": 250,
            "rotation": 100}
          ];
        shapeManager.setShapesJson(shapesJson);
    });

    $("#shapesCanvas").bind("change:selected", function(){
        var strokeColor = shapeManager.getStrokeColor();
        if (strokeColor) {
          $("input[value='" + strokeColor + "']").prop('checked', 'checked');
        } else {
           $("input[name='strokeColor']").removeProp('checked');
        }
        var strokeWidth = shapeManager.getStrokeWidth() || 1;
        $("select[name='strokeWidth']").val(strokeWidth);
    });

    $("#shapesCanvas").bind("change:shape", function(event, shapes){
        console.log("changed", shapes);
    });

    $("#shapesCanvas").bind("new:shape", function(event, shape){
        console.log("new", shape.toJson());
        console.log("selected", shapeManager.getSelectedShapesJson());
    });

    // Add some shapes to display
    shapeManager.addShapeJson({"id": 1234,
                               "type": "Rectangle",
                               "strokeColor": "#ff00ff",
                               "strokeWidth": 6,
                               "x": 200, "y": 150,
                               "width": 125, "height": 150});

    shapeManager.setState("SELECT");
});

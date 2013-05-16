// TESTING
// ======================================================================

function getModelView( worldObject ) {

  wObject = worldObject ||
            currentShape.controlPointsGroup.children[0];
/*
object.matrixWorld => objectMatrix
camera.projectionMatrix => projectionMatrix
camera.matrixWorldInverse => viewMatrix
camera.matrixWorldInverse * object.matrixWorld => modelViewMatrix
*/


  //wObject.updateMatrix();

  modelViewMatrix = camera.matrixWorldInverse.clone();

  scene.updateMatrixWorld();
  modelViewMatrix.multiplySelf( wObject.matrixWorld );


  return modelViewMatrix;
}

function getModelViewX( worldObject ) {

  m = getModelView( worldObject );
  return (new THREE.Vector3(m.n11, m.n21, m.n31));
}

function getModelViewY( worldObject ) {

  m = getModelView( worldObject );
  return (new THREE.Vector3(m.n12, m.n22, m.n32));
}

function getModelViewZ( worldObject ) {

  m = getModelView( worldObject );
  return (new THREE.Vector3(m.n13, m.n23, m.n33));
}

function drawLine( p1, p2, colorIn ) {

  // STOP look at proj01
  var p1 = p1 || new THREE.Vector3();
  var lineGeom = new THREE.Geometry();

  lineGeom.vertices.push( new THREE.Vertex(p1) );
  lineGeom.vertices.push( new THREE.Vertex(p2) );

  var lineMtrl = new THREE.LineBasicMaterial( {color: colorIn,
                                               opacity: 1,
                                               linewidth: 2} );

  var lineMesh = new THREE.Line( lineGeom, lineMtrl );
  scene.add( lineMesh );
}

function drawWorldAxis( center ) {

  drawLine( new THREE.Vector3(0, 0, 0), getModelViewX(), 0xff0000 );
  drawLine( new THREE.Vector3(0, 0, 0), getModelViewY(), 0x00ff00 );
  drawLine( new THREE.Vector3(0, 0, 0), getModelViewZ(), 0x0000ff );

}

function drawPlane ( pos ) {

  planeGeom = new THREE.PlaneGeometry ( 1, 1 );

  planeMtrl = new THREE.Material
  planeMtrl = new THREE.MeshBasicMaterial( { color: 0x006699,
                                                opacity: 1 } );

  planeMesh = new THREE.Mesh( planeGeom, planeMtrl );
  planeMesh.position = pos || new THREE.Vector3( 0, 0, 0 );

  scene.add ( planeMesh );
}

// ======================================================================





// ======================================================================
// GLOBALS
// ======================================================================
cpIndex = -1;
mouseX1 = 0;
mouseY1 = 0;

/* STATES
up.control_point
up.canvas
up.gui
down.control_point
down.canvas
down.gui
*/
cursorState = new Object();
cursorState.button = "up";
cursorState.where  = "not_set";
// ======================================================================

InputCurve = function( order ) {

  this.points = new Array();
  this.weights = new Array();
  this.knot = new Array();
  this.order = order || 3;
  this.dividedByWeights = false;

  // TODO
  this.divideByWeights = function() {

    if (this.points instanceof Array &&
        this.points.length > 0 &&
        this.points[0] instanceof THREE.Vector3 &&
        this.points.length == this.weights.length //&&
        //!this.divideByWeights )
        )
    {
      for (var i = 0; i < this.points.length; i++)
      {
        this.points[i].x = this.points[i].x / this.weights[i];
        this.points[i].y = this.points[i].y / this.weights[i];
        this.points[i].z = this.points[i].z / this.weights[i];
      }
      this.divideByWeights = true;
    }
    else
      console.log("ERROR: InputCurve.divideByWeights()\n");
  };

  this.getCameraPosition = function() {

    if (this.points instanceof Array &&
        this.points.length > 0 &&
        this.points[0] instanceof THREE.Vector3)
    {
        var min = new THREE.Vector3(0, 0, 0);
        min.x = this.points[0].x;
        min.y = this.points[0].y;
        min.z = this.points[0].z;
        var max = new THREE.Vector3(0, 0, 0);
        max.x = this.points[0].x;
        max.y = this.points[0].y;
        max.z = this.points[0].z;

      for (var i = 0; i < this.points.length; i++)
      {
        // calculate min
        if (this.points[i].x < min.x) min.x = this.points[i].x;
        if (this.points[i].y < min.y) min.y = this.points[i].y;
        if (this.points[i].z < min.z) min.z = this.points[i].z;
        // calculate max
        if (this.points[i].x > max.x) max.x = this.points[i].x;
        if (this.points[i].y > max.y) max.y = this.points[i].y;
        if (this.points[i].z > max.z) max.z = this.points[i].z;
      }
      var camPosZ = Math.sqrt( Math.pow( max.x - min.x, 2) +
                               Math.pow( max.y - min.y, 2) +
                               Math.pow( max.z - min.z, 2) )
                    / Math.tan((35 * Math.PI) / 180);

      var camPos = new THREE.Vector3(0,0,0);
      camPos.z = camPosZ ;      

      return camPos;
    }
  }

  this.getCenterGeometry = function() {

    if (this.points instanceof Array &&
        this.points.length > 0 &&
        this.points[0] instanceof THREE.Vector3)
    {
        var sum = new THREE.Vector3(0, 0, 0);

      for (var i = 0; i < this.points.length; i++)
        sum.add(sum, this.points[i]);

      var centerGeometry = new THREE.Vector3(0,0,0);
      centerGeometry.x = sum.x / this.points.length;
      centerGeometry.y = sum.y / this.points.length;
      centerGeometry.z = sum.z / this.points.length;
      return centerGeometry;
    }
  }
};

InputDirective = function( type, args ) {

  this.type = type;
  this.args = args;

};

// Object to store raw input curves and surface construction directives
InputFileParsed = function( ) {

  this.curves = new Array();
  this.directives = new Array();

  this.getCameraPosition = function() {

    if (this.curves instanceof Array &&
        this.curves.length > 0 &&
        this.curves[0] instanceof InputCurve)
    {
      // TODO: compute average of all curves
      return this.curves[0].getCameraPosition();
    }
  };

  this.getCenterGeometry = function() {

    if (this.curves instanceof Array &&
        this.curves.length > 0 &&
        this.curves[0] instanceof InputCurve)
    {
      // TODO: compute average of all curves
      return this.curves[0].getCenterGeometry();
    }
  };
};


function parseAndLoad(data) {

  // TODO: find better way to remove previous curve
  if (scene.children.length > 1)
  {
    // removing previous objects from screen
    for (var i = 1; i < scene.children.length; i++)
      scene.removeObject(scene.children[i]);

    // actually deleting previous objects
    scene.children.splice(1, scene.children.length - 1);
  }

  inFileParsed = new InputFileParsed();
  dataArray = data.split(/\s+/);

  // TODO: find better way to do this
  // Remove last element if empty
  if (dataArray[dataArray.length - 1] == "")
    dataArray.splice(dataArray.length - 1,1)

  var nextToken = '';
  while ( dataArray.length > 0 )
  {
    nextToken = dataArray.splice(0, 1);
    if (nextToken == "c_NURBSCurve")
    {
      var numPoints = parseInt(dataArray.splice(0, 1));
      var order = parseInt(dataArray.splice(0, 1));
      var inCurve = new InputCurve( order );

      for (var i = 0; i < numPoints; i++)
      {
        inCurve.points.push(new THREE.Vector3(
          parseFloat(dataArray.splice(0, 1)),
          parseFloat(dataArray.splice(0, 1)),
          parseFloat(dataArray.splice(0, 1))));
        inCurve.weights.push( parseFloat(dataArray.splice(0, 1)) );
      }

      for (var i = 0; i < numPoints + order; i++)
        inCurve.knot.push(parseFloat(dataArray.splice(0, 1)));

      // Add one curve to global data object
      // TODO below
      //inCurve.divideByWeights();
      inFileParsed.curves.push(inCurve);
    }

    else if (nextToken == "sweep")
    {
      var args = new Array();

      // curve index
      args.push( parseInt(dataArray.splice(0, 1)) );
      
      //sweep vector
      var sweepVector = new THREE.Vector3( parseFloat(dataArray.splice(0, 1)),
                                           parseFloat(dataArray.splice(0, 1)),
                                           parseFloat(dataArray.splice(0, 1)) );

      args.push( sweepVector );
      inFileParsed.directives.push( new InputDirective(nextToken[0], args) );
    }
    else
      console.log("Parsing Error, unrecognized token: " + nextToken);
  }

  cameraControls.target = inFileParsed.getCenterGeometry();
  camera.position = inFileParsed.getCameraPosition();
  camera.up = new THREE.Vector3(0, 1, 0);

  
  //construct surface
  if (inFileParsed.directives instanceof Array &&
      inFileParsed.directives[0] instanceof InputDirective)
  {
    if (inFileParsed.directives[0].type == "sweep")
    {
      // NOTE: arg[0] is curve index number
      //       arg[1] is sweep vector
      var curveIndex = inFileParsed.directives[0].args[0];
      bsplineNew = new THREE.NURBSCurve( inFileParsed.curves[curveIndex].points,
                                            inFileParsed.curves[curveIndex].knot,
                                            inFileParsed.curves[curveIndex].order );
      sweepVector = inFileParsed.directives[0].args[1];

      // 0: sweep
      currentShape = new NURBSSurfaceBuilder( bsplineNew , 0, sweepVector, 
                                       "currentShape" );
      currentShape.addToScene( scene );
    }

    else console.log("ERROR: invalid construction method\n");
  }
  // render curve
  else
  {
      var curveIndex = 0;
      bsplineNew = new THREE.NURBSCurve( inFileParsed.curves[curveIndex].points,
                                            inFileParsed.curves[curveIndex].knot,
                                            inFileParsed.curves[curveIndex].order );

      // 0: sweep
      currentShape = new NURBSCurveBuilder(bsplineNew, "curve");
      currentShape.addToScene( scene );
  }
}

setDragAlongPlane = "xy";
function setDragAlong( plane ) {

  setDragAlongPlane = plane;
}

function toggleBoundBox() {

  if (currentShape instanceof NURBSCurveBuilder)
  {
    if($.inArray(currentShape.boundBoxMesh, scene.children) > -1)
      scene.remove(currentShape.boundBoxMesh);
    else
      scene.add(currentShape.boundBoxMesh);
  }
  if (currentShape instanceof NURBSSurfaceBuilder)
  {
    if($.inArray(currentShape.bbMeshU, scene.children) > -1)
      scene.remove(currentShape.bbMeshU);
    else
      scene.add(currentShape.bbMeshU);
    if($.inArray(currentShape.bbMeshV, scene.children) > -1)
      scene.remove(currentShape.bbMeshV);
    else
      scene.add(currentShape.bbMeshV);
  }
}
function toggleShape () {

  if (currentShape instanceof NURBSCurveBuilder)
  {
    if($.inArray(currentShape.curveMesh, scene.children) > -1)
      scene.remove(currentShape.curveMesh);
    else
      scene.add(currentShape.curveMesh);
  }
  if (currentShape instanceof NURBSSurfaceBuilder)
  {
    if($.inArray(currentShape.surfMesh, scene.children) > -1)
      scene.remove(currentShape.surfMesh);
    else
      scene.add(currentShape.surfMesh);
  }
}

function toggleControlPoints () {

  if (currentShape instanceof NURBSCurveBuilder)
  {
    if($.inArray(currentShape.controlPointsGroup, scene.children) > -1)
      scene.remove(currentShape.controlPointsGroup);
    else
      scene.add(currentShape.controlPointsGroup);
  }
  if (currentShape instanceof NURBSSurfaceBuilder)
  {
    if($.inArray(currentShape.controlPointsGroup, scene.children) > -1)
      scene.remove(currentShape.controlPointsGroup);
    else
      scene.add(currentShape.controlPointsGroup);
  }
}

function zoom( deltaZoom ) {

  var cameraPath = new THREE.Vector3();
  cameraPath.sub(camera.position, cameraControls.target);
  cameraPath.multiplyScalar(deltaZoom);

  camera.position.add(camera.position, cameraPath);
}

function loadCurvesFolder() {

  $('#curves-folder').fileTree({
    root: '/home/neoluthi/public_html/proj02/curves/' },

    function(file) {
      currentFile = file.replace("/home/neoluthi/public_html", "");

      $.get(currentFile, function(data) { parseAndLoad(data); });
    }
  );
}
  
// add jqueryUI actions
$(function() {

  $("#accordion").accordion({ header: "h3" });
  $('#tabs').tabs();
  $(".draggable").draggable();
  $(".draggable").resizable();
  $( "input:submit, a, button", ".demo" ).button();
  $( "a", ".demo" ).click(function() { return false; });
});


$(document).ready( function() {

  loadCurvesFolder();

  $(document).mousemove(function(e) {
  
    mouseX0 = e.pageX;
    mouseY0 = e.pageY;
  
    // make sure screen coordinates have been generated for control points
    if (typeof currentShape != 'undefined' &&
        typeof currentShape.screenCoord != 'undefined' ) {
  
      // check if cursor is on top of control point
      var screenCoord = currentShape.screenCoord;
      var i = 0;
      if (cursorState.button == "up")
        cursorState.where = "not_control_point";
      for (i = 0; i < screenCoord.length; i++) {
  
        var dx = screenCoord[i].x - e.pageX;
        var dy = screenCoord[i].y - e.pageY;
        
        if ( cursorState.button == "up" &&
             Math.abs(dx) < 20 && Math.abs(dy) < 20 ) {
    
          cursorState.where = "control_point";

          // remove event listeners from camera control
          // TODO: change TrackballControls to make this work
          cameraControls.enabled = false;

          cpIndex = i;
  
          // paint all control points to their 'unselected' color and then
          // paint the the one being selecte to its 'selected' color
          for (var i = 0; i < currentShape.controlPointsGroup.children.length; i++)
          {
            var cPoint = currentShape.controlPointsGroup.children[i];
            cPoint.material.color.r = 0;
            cPoint.material.color.g = 0.4;
            cPoint.material.color.b = 0.6;
          }
          var cPoint = currentShape.controlPointsGroup.children[cpIndex];
          cPoint.material.color.r = 1;
          cPoint.material.color.g = 0.3;
          cPoint.material.color.b = 0.1;
  
          break;
        }
      }
          
      // move control point
      if (cursorState.button == "down" && 
          cursorState.where == "control_point") {

        mouseDX = mouseX0 - mouseX1;
        mouseDY = mouseY0 - mouseY1;
        // STOP
        //var curveRadius = currentShape.curveGeometry.boundingSphere.radius;
        var curveRadius = inFileParsed.getCameraPosition().z;
        if (setDragAlongPlane == "xy") {
          var movDeltaWorld = new THREE.Vector3( curveRadius * mouseDX / 200.0,
                                                -curveRadius * mouseDY / 200.0,
                                                0);
        }
        else if (setDragAlongPlane == "xz") {
          var movDeltaWorld = new THREE.Vector3( curveRadius * mouseDX / 200.0,
                                                 0,
                                                -curveRadius * mouseDY / 200.0);
        }
        if (setDragAlongPlane == "yz") {
          var movDeltaWorld = new THREE.Vector3( 0,
                                                 curveRadius * mouseDX / 200.0,
                                                -curveRadius * mouseDY / 200.0);
        }
        currentShape.moveControlPoint(cpIndex, movDeltaWorld);

        mouseX1 = mouseX0;
        mouseY1 = mouseY0;

        if (typeof currentShape != 'undefined' &&
            cursorState.where == "control_point") {

          currentShape.rebuild();
        }

      }
      else if (cursorState.button == "up" &&
               cursorState.where != "control_point" &&
               cpIndex > -1) {

        var cPoint = currentShape.controlPointsGroup.children[cpIndex];
        cPoint.material.color.r = 0;
        cPoint.material.color.g = 0.4;
        cPoint.material.color.b = 0.6;
        cpIndex = -1;
      }
    }
  });


  $(document).mousedown(function(e) {
    
    mouseDownX = e.pageX;
    mouseDownY = e.pageY;

    mouseX1 = mouseX0;
    mouseY1 = mouseY0;

    cursorState.button = "down";

  }); 

  $(document).mouseup(function(e) {

    mouseUpX = e.pageX;
    mouseUpY = e.pageY;

    cursorState.button = "up";
    cursorState.where  = "not_control_point";

    // add event listeners to camera control
    cameraControls.enabled = true;

  });
});


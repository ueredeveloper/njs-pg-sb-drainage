let map;
let polygon = [];

function initMap() {
  const myLatLng = { lat: -25.363, lng: 131.044 };
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 4,
    center: myLatLng,
  });

  const drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.POLYGON,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: [
        google.maps.drawing.OverlayType.MARKER,
        google.maps.drawing.OverlayType.CIRCLE,
        google.maps.drawing.OverlayType.POLYGON,
        google.maps.drawing.OverlayType.POLYLINE,
        google.maps.drawing.OverlayType.RECTANGLE,
      ],
    },
    markerOptions: {
      icon: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
    },
    circleOptions: {
      fillColor: "#ffff00",
      fillOpacity: 1,
      strokeWeight: 5,
      clickable: false,
      editable: true,
      zIndex: 1,
    },
  });

  google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
    
  if (event.type == 'polygon') {
    event.overlay.getPath().getArray().forEach(p=>{
      polygon.push([p.lat(), p.lng()])
    });
    polygon = [...polygon, polygon[0]]
   getPointsByPolygon (polygon).then(points=>{

     console.log(points);
   });
  }
  if (event.type == 'marker') {
    let position = event.overlay.position;
    console.log(position.lat(), position.lng())
  }
});

  drawingManager.setMap(map);

}

window.initMap = initMap;

let url = 'https://njs-pg-sb-drainage.ueredeveloper.repl.co';

async function getPointsByPolygon (polygon) {

   let points = await fetch(url + '/getPointsByPolygon', {
      method: 'POST', 
      headers:{'Content-Type': 'application/json'},
      body: JSON.stringify(polygon)
    }).then(response=>{
      return response.json();
    })

  return points;
}

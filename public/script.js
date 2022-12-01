let map;
let polygon = [];

function initMap() {
  const myLatLng = { lat: -18.864795325340555, lng: 135.60597000236692 };
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 4,
    center: myLatLng,
  });

  const drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.RECTANGLE,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: [
        google.maps.drawing.OverlayType.MARKER,
        google.maps.drawing.OverlayType.CIRCLE,
        google.maps.drawing.OverlayType.POLYGON,
        google.maps.drawing.OverlayType.RECTANGLE,
      ],
    },
    markerOptions: {
      icon: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
    },
    circleOptions: {
      fillColor: "#ffff00",
      fillOpacity: 0.2,
      strokeWeight: 5,
      clickable: false,
      editable: true,
      zIndex: 1,
    },
  });


  google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {

    if (event.type == 'polygon') {
      console.log(event.overlay.getPath().getArray())

      event.overlay.getPath().getArray().forEach(p => {
        polygon.push([p.lng(), p.lat()])
      });

      polygon = [...polygon, polygon[0]]
      getPointsInsidePolygon(polygon).then(points => {

        points.forEach(p => {
          let _p = p.shape.coordinates;
          new google.maps.Marker({
            position: { lat: _p[1], lng: _p[0] },
            title: "Hello World!",
            map
          });
        })
      });
    }
    if (event.type == 'circle') {
      let { center, radius } = event.overlay;
      getPointsInsideCircle(
        {
          center: { lng: center.lng(), lat: center.lat() },
          radius: parseInt(radius)
        }
      )
        .then((points) => {
          points.forEach(p => {
            let _p = p.shape.coordinates;
            new google.maps.Marker({
              position: { lat: _p[1], lng: _p[0] },
              title: "Hello World!",
              map
            });
          });
        });
    }
    if (event.type == 'marker') {
      let point = event.overlay.position;
      console.log(`${point.lng()},${point.lat()}`)
      insertPoint({ lat: point.lat(), lng: point.lng() })
    }
    if (event.type == 'rectangle') {
      let bounds = event.overlay.getBounds();
      let NE = bounds.getNorthEast();
      let SW = bounds.getSouthWest();
      /** SUPABASE
       * Buscar pontos em um retângulo
       * @param nex {float} Noroeste longitude
       * @param ney {float} Noroeste latitude
       * @param swx {float} Sudoeste longitude
       * @param swy {float} Sudoeste longitude
       * @returns {array[]} Interferencias outorgadas.
     */
      let rectangle = { nex: NE.lng(), ney: NE.lat(), swx: SW.lng(), swy: SW.lat() }

      getPointsInsideRectangle(rectangle).then(points => {

        points.forEach(p => {
          let _p = p.shape.coordinates;
          new google.maps.Marker({
            position: { lat: _p[1], lng: _p[0] },
            title: "Hello World!",
            map
          });
        })
      });
    }
  });

  drawingManager.setMap(map);
}

window.initMap = initMap;

let url = 'https://njs-pg-sb-drainage.ueredeveloper.repl.co';

async function getPointsInsidePolygon(polygon) {
  console.log(polygon)
  let points = await fetch(url + '/getPointsInsidePolygon', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(polygon)
  }).then(response => {
    return response.json();
  })

  return points;
}
async function getPointsInsideCircle(circle) {

  let points = await fetch(url + '/getPointsInsideCicle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(circle)
  }).then(response => {
    return response.json();
  })

  return points;
}

async function getPointsInsideRectangle(rectangle) {
  let points = await fetch(url + '/getPointsInsideRectangle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rectangle)
  }).then(response => {
    return response.json();
  })

  return points;
}

async function insertPoint(point) {
  console.log(point)
  await fetch(url + `/insertPoint?lat=${point.lat}&lng=${point.lng}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }).then(response => {
    console.log(response)
  })

}

const express = require('express');
const app = express();
const { convertionPolygonToPostgis } = require('./tools');
const xml2js = require('xml2js');

app.use(express.static('public'));
app.use(express.json())

const { createClient } = require('@supabase/supabase-js');

const spURL = process.env.SUPABASE_URL;
const spKey = process.env.SUPABASE_KEY;
const spServiceRole = process.env.SERVICE_ROLE
const supabase = createClient(spURL, spKey);

/**
* Recebe um polígono e busca no anco postgress os pontos outorgados dentro daquele polígono.
* @param polygon {array} String de um polígono no formato postgres SQL, ex: let polygon = 'SRID=4674;POLYGON((1 2, 2 3, 4 5))'
*/
app.post('/getPointsInsidePolygon', async function(req, res) {

  let polygon = convertionPolygonToPostgis(req.body);
  const { data, error } = await supabase
    .rpc('getpointsinsidepolygon', { polygon: polygon })
  if (error) {
    console.log(error)
  } else {
    res.send(JSON.stringify(data))
  }
});
/**
* Buscar pontos em um retângulo
* @param nex {float} Noroeste longitude
* @param ney {float} Noroeste latitude
* @param swx {float} Sudoeste longitude
* @param swy {float} Sudoeste longitude
* @returns {array[]} Interferencias outorgadas.
*/
app.post('/getPointsInsideRectangle', async function(req, res) {

  let { nex, ney, swx, swy } = req.body;

  const { data, error } = await supabase
    .rpc('getpointsinsiderectangle', { nex: nex, ney: ney, swx: swx, swy: swy })
  if (error) {
    console.log(error)
  } else {
    res.send(JSON.stringify(data))
  }
});

app.post('/getPointsInsideCicle', async function(req, res) {
  let { center, radius } = req.body;

  const { data, error } = await supabase
    .rpc(
      'getpointsinsidecircle',
      { center: `POINT(${center.lng} ${center.lat})`, radius: parseInt(radius) }
    );

  if (error) {
    console.log(error)
  } else {
    res.send(JSON.stringify(data))
  }
});
/**
  * Inserir ponto de coordenada no banco. 
  * SQL eg: insert into interferencia (shape) values ('POINT(0 0)')
  *
  *
  */
app.get('/insertPoint', async function(req, res) {
  let { lat, lng } = req.query;
  console.log(lat, lng)
  const { error } = await supabase
    .from('interferencia')
    .insert({ australia: false, shape: `POINT(${lng} ${lat})`, PROCESSO: 'PROCESSO' })
  if (error) {
    console.log(error)
  } else {
    res.send("Ponton inserido!")
  }
});

app.post('/insertPoints', async function(req, res) {

  let outorga = req.body;
  // capturar lng e lat => x, y
  let { x, y} = outorga[0].int_shape.points[0];
  let {fin_finalidade, dt_demanda} = outorga[0];
  // modificar o objeto para o formato do banco postgres
  outorga[0].int_shape = `POINT(${x} ${y})`;

  xml2js.parseString(
    fin_finalidade,
    {explicitRoot:false, preserveChildrenOrder:true}, (err, result) => {
  if (err) {
    throw err
  }
  outorga[0].fin_finalidade = JSON.stringify(result)
});

  xml2js.parseString(dt_demanda,{explicitRoot:false, preserveChildrenOrder:true}, (err, result) => {
  if (err) {
    throw err
  }
  outorga[0].dt_demanda = JSON.stringify(result)
});

  const { data, error } = await supabase
    .from('outorgas')
    .upsert(outorga[0],
      { onConflict: 'int_id' })
    .select()
  if (error) {

    res.send(JSON.stringify({ message: error }))
  } else {
    console.log(data, error)
    res.send(JSON.stringify({ message: error, data: data }))
  }

  /*
  let points = req.body;
  let response = await points.map((point, i) => {
    const { error } = supabase
      .from('outorgas')
      .insert({ PROCESSO: point.PROCESSO })
    if (error) {
      return { id: i, message: error }
    } else {
      return { id: i, message: 'ok' }
    }

  });
  */

  // res.send(response)
});

const port = 3000;
app.listen(port, function() {
  console.log(`porta ${port}`)
})
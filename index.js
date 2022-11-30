
const express = require('express');
const app = express();
const {convertionToPostgres} = require('./tools')

app.use(express.static('public'));
app.use(express.json())

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
* Recebe um polígono e busca em um banco postgress os pontos outorgados dentro daquele polígono.
* @param polygon {array} String de um polígono no formato postgres SQL, ex: let polygon = 'POLYGON((0 0, 8 0, 4 4, 0 0))
*/
app.post('/getPointsByPolygon', async function(req, res){
  let pg_polygon = await convertionToPostgres(req.body);
  let points = await selectContains (pg_polygon)
  await res.send(JSON.stringify({points: points}))
})

/**
  * Selecionar todos os resultados e mostrar as colunas id e shape
  */
async function selectAll (){
  const { data, error } = await supabase
  .from('interferencia')
  .select(`
   id, shape
  `);
  if (error){
    console.log(error)
  } else {
    console.log(data)
  }
}

//selectAll()

async function selectContains (polygon){
  //let polygon = 'POLYGON((0 0, 8 0, 4 4, 0 0))'
  const {data, error} = await supabase
  .rpc('selectcontains', {polygon: polygon})
    
    //(`SELECT * FROM interferencia WHERE ST_Contains(ST_AsText('POLYGON((0 0, 8 0, 4 4, 0 0))'), shape)`)
 if(error) console.log(error)
 return data
}

//selectContains();

const port = 3000;
app.listen(port, function(){
  console.log(`porta ${port}`)
})
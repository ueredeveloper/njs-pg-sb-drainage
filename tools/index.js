 
/**
* Conversão do polígono para o formato de busca no banco postgres.
  * @param polygon {object[]}
  * @returns {string} Exemplo de retorno: 'POLYGON((0 0, 8 0, 4 4, 0 0))'
  */
exports.convertionToPostgres = function (polygon){

  let _polygon = JSON.stringify(polygon);
  _polygon = _polygon.replaceAll('[[', '');
  _polygon = _polygon.replaceAll(',', ' ');
  _polygon = _polygon.replaceAll('] [', ',');
  _polygon = _polygon.replaceAll(']]', '');

  _polygon = 'POLYGON((' + _polygon + '))';
  return _polygon;
}
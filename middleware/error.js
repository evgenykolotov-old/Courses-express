module.exports = function(request, response, next) {
  response.status(404).render('404', {
    title: 'Страница не найдена'
  });
}
const keys = require('../keys');

module.exports = function(email, token) {
  return {
    to: email,
    from: keys.EMAIL_FROM,
    subject: 'Восстановление доступа',
    html: `
      <h1>Вы забыли пароль?</h1>
      <p>Если нет, проигнорируйте жто письмо</p>
      <p>Чтобы восстановить пароль, перейдите по ссылке ниже:</p>
      <p><a href="${keys.BASE_URL}/auth/password/${token}">Восстановить доступ</a></p>
      <hr />
      <a href="${keys.BASE_URL}">Courses</a>
    `
  }
}
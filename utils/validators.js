const { body } = require('express-validator');
const User = require('../models/user');

exports.registerValidators = [
  body('email')
    .isEmail().withMessage('Введите корректный email')
    .custom(async (value, { request }) => {
      try {
        const user = await User.findOne({ email: value });
        if (user) {
          return Promise.reject('Такой пользователь уже существует');
        }
      } catch (error) {
        console.log(error);
      }
    })
    .normalizeEmail(),
  body('password', 'Пароль должен быть минимум 6 символов')
    .isLength({ min: 6, max: 56 })
    .isAlphanumeric()
    .trim(),
  body('confirm').custom((value, { request }) => {
    if (value !== request.body.password) {
      throw new Error('Пароль должны совпадать');
    }
    return true;
  }).trim(),
  body('name').isLength({ min: 3 }).withMessage('Имя должно быть минимум 3 символа').trim()
];

exports.courseValidators = [
  body('title').isLength({ min: 3 }).withMessage('Минимальная длинна названия 3 символа').trim(),
  body('price').isNumeric().withMessage('Введите корректную цену'),
  body('img', 'Введите корректный url каринки').isURL(),
];
const { Router } = require('express');
const Course = require('../models/course');
const auth = require('../middleware/auth');
const { courseValidators } = require('../utils/validators');
const { validationResult } = require('express-validator');
const router = Router();

router.get('/', auth, (request, response) => {
  response.render('add', {
    title: 'Добавить курс',
    isAdd: true,
  })
})

router.post('/', auth, courseValidators, async (request, response) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(422).render('add', {
      title: 'Добавить курс',
      isAdd: true,
      error: errors.array()[0].msg,
      data: {
        title: request.body.title,
        price: request.body.price,
        img: request.body.img,
      }
    })
  }

  const course = new Course({
    title: request.body.title,
    price: request.body.price,
    img: request.body.img,
    userId: request.user
  });
  try {
    await course.save();
    response.redirect('/courses');
  } catch (error) {
    console.log(error);
  }
})

module.exports = router;
const { Router, response } = require('express');
const Course = require('../models/course');
const auth = require('../middleware/auth');
const { courseValidators } = require('../utils/validators');
const { validationResult } = require('express-validator');
const router = Router();

router.get('/', async (request, response) => {
  try {
    const courses = await Course.find()
    .populate('userId', 'email name')
    .select('title price img');

    response.render('courses', {
      title: 'Курсы',
      userId: request.user ? request.user._id.toString() : null,
      isCourses: true,
      courses,
    });
  } catch (error) {
    console.log(error);
  }
})

router.get('/:id', async (request, resposne) => {
  try {
    const course = await Course.findById(request.params.id);
    resposne.render('course', {
      layout: 'empty',
      title: `Курс ${course.title}`,
      course
    });    
  } catch (error) {
    console.log(error);
  }
})

router.get('/:id/edit', auth, async (request, response) => {
  if (!request.query.allow) {
    return response.redirect('/');
  }
  try {
    const course = await Course.findById(request.params.id);
    if (course.userId.toString() !== request.user._id.toString()) {
      return response.redirect('/courses');
    }
    response.render('course-edit', {
      title: `Редактировать ${course.title}`,
      course
    });  
  } catch (error) {
    console.log(error);
  }
})

router.post('/edit', auth, courseValidators, async (request, response) => {
  const { id } = request.body;
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(422).redirect(`/courses/${id}/edit?allow=true`)
  }
  try {
    delete request.body.id;
    const course = await Course.findById(id);
    if (course.userId.toString() !== request.user._id.toString()) {
      return response.redirect('/courses');
    }
    Object.assign(course, request.body);
    course.save();
    response.redirect('/courses');
  } catch (error) {
    console.log(error);
  }
})

router.post('/remove', auth, async (request, response) => {
  try {
    await Course.deleteOne({ 
      _id: request.body.id,
      userId: request.user._id,
    });
    response.redirect('/courses');
  } catch (error) {
    console.log(error);
  }
})

module.exports = router;
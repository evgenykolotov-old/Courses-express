const { Router } = require('express');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');
const bcrypt = require('bcryptjs');
const keys = require('../keys');
const regEmail = require('../emails/registration');
const resetEmail = require('../emails/reset');
const router = Router();
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { registerValidators } = require('../utils/validators');

const transporter = nodemailer.createTransport(sendgrid({
  auth: { api_key: keys.SENDGRID_API_KEY }
}))

router.get('/login', async (request, response) => {
  response.render('auth/login', {
    title: 'Авторизация',
    isLogin: true,
    loginError: request.flash('loginError'),
    registerError: request.flash('registerError'),
  })
})

router.get('/logout', async (request, response) => {
  request.session.destroy(() => {
    response.redirect('/auth/login');
  })
})

router.post('/login', async (request, response) => {
  try {
    const { email, password } = request.body;
    const candidate = await User.findOne({ email });
    if (candidate) {
      const areSame = await bcrypt.compare(password, candidate.password);
      if (areSame) {
        request.session.user = candidate;
        request.session.isAuthenticated = true;
        request.session.save(error => {
          if (error) throw error;
          response.redirect('/');
        })
      } else {
        request.flash('loginError', 'Неверный email или пароль');
        response.redirect('/auth/login#login');
      }
    } else {
      request.flash('loginError', 'Такого пользователя не существует');
      response.redirect('/auth/login#login');
    }
  } catch (error) {
    console.log(error);
  }
})

router.post('/register', registerValidators, async (request, response) => {
  try {
    const { email, password, name } = request.body;
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      request.flash('registerError', errors.array()[0].msg);
      return response.status(422).redirect('/auth/login#register')
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, name, password: hashPassword, cart: { items: [] } });
    await user.save();
    response.redirect('/auth/login');
    await transporter.sendMail(regEmail(email));
  } catch (error) {
    console.log(error);
  }
})

router.get('/reset', (request, response) => {
  response.render('auth/reset', {
    title: 'Сброс пароля',
    error: request.flash('error'),
  })
})

router.post('/reset', (request, response) => {
  try {
    crypto.randomBytes(32, async (error, buffer) => {
      if (error) {
        request.flash('error', 'Что-то пошло не так, повторите попытку позже');
        return response.redirect('/auth/reset');
      }
      const token = buffer.toString('hex');
      const candidate = await User.findOne({ email: request.body.email });
      if (candidate) {
        candidate.resetToken = token;
        candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;
        await candidate.save();
        await transporter.sendMail(resetEmail(candidate.email, token));
        response.redirect('/auth/login');
      } else {
        request.flash('error', 'Такой email не зарегистрирован');
        response.redirect('/auth/reset'); 
      }
    })
  } catch (error) {
    console.log(error);
  }
})

router.get('/password/:token', async (request, response) => {
  if (!request.params.token) {
    return response.redirect('/auth/login');
  }
  try {
    const user = await User.findOne({
      resetToken: request.params.token,
      resetTokenExp: { $gt: Date.now() }
    })
    if (!user) {
      return response.redirect('/auth/login');
    } else {
      response.render('/auth/password', {
        title: 'Восстаовить доступ',
        error: request.flash('error'),
        userId: user._id.toString(),
        token: request.params.token,
      })
    }
  } catch (error) {
    console.log(error);
  }
})

router.post('/password', async (request, response) => {
  try {
    const user = await User.findOne({
      _id: request.body.userId,
      resetToken: request.body.token,
      resetTokenExp: { $gt: Date.now() },
    })
    if (user) {
      user.password = await bcrypt.hash(request.body.password, 10);
      user.resetToken = undefined;
      user.resetTokenExp = undefined;
      await user.save();
      response.redirect('auth/login');
    } else {
      request.flash('loginError', 'Время жизни токена истекло');
      response.redirect('/auth/login');
    }
  } catch (error) {
    console.log(error);
  }
})

module.exports = router;
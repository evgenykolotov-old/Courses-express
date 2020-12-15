const { Router } = require('express');
const Order = require('../models/order');
const auth = require('../middleware/auth');
const router = Router();

router.get('/', auth, async (request, response) => {
  try {
    const orders = await Order.find({ 'user.userId': request.user._id })
      .populate('user.userId');
    response.render('orders', {
      isOrder: true,
      title: 'Заказы',
      orders: orders.map(o => {
        return {
          ...o._doc,
          price: o.courses.reduce((total, c) => {
            return total += c.count * c.course.price;
          }, 0),
        }
      })
    });
  } catch (error) {
    console.log(error);
  }
})

router.post('/', auth, async (request, response) => {
  try {
    const user = await request.user
      .populate('cart.items.courseId')
      .execPopulate();
    const courses = user.cart.items.map(item => ({
      count: item.count,
      course: { ...item.courseId._doc },
    }));
    const order = new Order({
      user: {
        name: request.user.name,
        userId: request.user,
      },
      courses,
    })
    await order.save();
    await request.user.clearCart();
    response.redirect('orders');
  } catch (error) {
    console.log(error);
  }
})

module.exports = router;
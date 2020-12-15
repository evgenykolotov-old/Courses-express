const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const compression = require('compression');
const Handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const homeRoutes = require('./routes/home');
const coursesRoutes = require('./routes/courses');
const addRoutes = require('./routes/add');
const cardRoutes = require('./routes/card');
const ordersRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const varMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');
const errorMiddleware = require('./middleware/error');
const fileMiddleware = require('./middleware/file');
const csrf = require('csurf');
const flash = require('connect-flash');
const keys = require('./keys');

const application = express();
const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs',
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  helpers: require('./utils/hbs-helpers'),
})
const store = new MongoStore({
  collection: 'sessions',
  uri: keys.MONGODB_URI,
})

application.engine('hbs', hbs.engine);
application.set('view engine', 'hbs');
application.set('views', 'views');

application.use(express.static(path.join(__dirname, 'public')));
application.use('/images', express.static(path.join(__dirname, 'images')));
application.use(express.urlencoded({ extended: true }));
application.use(session({
  secret: keys.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store,
}));
application.use(fileMiddleware.single('avatar'));
application.use(csrf());
application.use(flash());
application.use(compression());

application.use(varMiddleware);
application.use(userMiddleware);

application.use('/', homeRoutes);
application.use('/courses', coursesRoutes);
application.use('/add', addRoutes);
application.use('/card', cardRoutes);
application.use('/orders', ordersRoutes);
application.use('/auth', authRoutes);
application.use('/profile', profileRoutes);
application.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

async function startApplication() {
  try {
    await mongoose.connect(keys.MONGODB_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true, 
      useFindAndModify: false 
    });
    application.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    })
  } catch (error) {
    console.log(error);
  }
}

startApplication();

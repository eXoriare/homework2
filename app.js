const express = require('express')
const bcrypt = require('bcrypt')
const path = require('path')
const hbs = require('hbs')
const sessions = require('express-session')
const { db, dbb } = require('./DB')
const { checkAuth } = require('./src/middlewares/checkAuth')

const server = express()
const PORT = process.env.PORT || 3000

const saltRounds = 10

server.set('view engine', 'hbs')
server.set('views', path.join(process.cwd(), 'src', 'views'))
server.set('cookieName', 'sid')
hbs.registerPartials(path.join(process.cwd(), 'src', 'views', 'partials'))

const secretKey = 'akasljdfalksdjfalskdljf'

server.use(express.urlencoded({ extended: true }))
server.use(express.json())
server.use(express.static('public'))
server.use(sessions({
  name: server.get('cookieName'),
  secret: secretKey,
  resave: false, // Не сохранять сессию, если мы ее не изменим
  saveUninitialized: false, // не сохранять пустую сессию
  // store: new FileStore({ // выбираем в качестве хранилища файловую систему
  //   secret: secretKey,
  // }),
  cookie: { // настройки, необходимые для корректного работы cookie
    // secure: true,
    httpOnly: true, // не разрещаем модифицировать данную cookie через javascript
    maxAge: 86400 * 1e3, // устанавливаем время жизни cookie
  },
}))

server.use((req, res, next) => {
  const currentEmail = req.session?.user?.email

  if (currentEmail) {
    const currentUser = db.users.find((user) => user.email === currentEmail)
    res.locals.name = currentUser.name
  }

  next()
})

server.get('/', (req, res) => {
  res.render('main')
})

// start

server.get('/secret', checkAuth, (req, res) => {
  const query1 = req.query
  const quRe = query1.reverse
  const quLim = query1.limit
  let peopleForRender = dbb.people
  if (quRe !== undefined && quRe === 'true' && quLim === undefined) {
    peopleForRender = db.people.reverse()
  } else if (quLim !== undefined && Number.isNaN(+quLim) === false && quRe === undefined) {
    peopleForRender = db.people.slice(0, quLim)
  } else if ((quRe !== undefined && quRe === 'true' && quLim !== undefined && Number.isNaN(+quLim) === false)) {
    peopleForRender = db.people.slice(0, quLim).reverse()
  }

  res.render('secret', { listOfPeople: peopleForRender })
})

server.post('/adressbook', (req, res) => {
  const dataFromForm = req.body

  dbb.people.push(dataFromForm)

  res.redirect('/secret')
})

// stop

server.delete('/fetch', (req, res) => {
  res.sendStatus(204)
})

// server.get('/secret', checkAuth, (req, res) => {
//   res.render('secret')
// })

server.get('/auth/signup', (req, res) => {
  res.render('signUp')
})

server.post('/auth/signup', async (req, res) => {
  const { name, email, password } = req.body

  const hashPass = await bcrypt.hash(password, saltRounds)

  db.users.push({
    name,
    email,
    password: hashPass,
  })

  req.session.user = {
    email,
  }

  res.redirect('/')
})

server.get('/auth/signin', async (req, res) => {
  res.render('signIn')
})

server.post('/auth/signin', async (req, res) => {
  const { email, password } = req.body

  const currentUser = db.users.find((user) => user.email === email)

  if (currentUser) {
    if (await bcrypt.compare(password, currentUser.password)) {
      req.session.user = {
        email,
      }

      return res.redirect('/')
    }
  }

  return res.redirect('/auth/signin')
})

server.get('/auth/signout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.redirect('/')

    res.clearCookie(req.app.get('cookieName'))
    return res.redirect('/')
  })
})

server.listen(PORT, () => {
  console.log(`Go, go server: ${PORT}`)
})

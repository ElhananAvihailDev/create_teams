const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const cookieParser = require('cookie-parser')
const session = require('express-session')

const app = express()
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Express App Config
app.use(cookieParser())
app.use(bodyParser.json());
app.use(session({
    secret: 'bambula Shtrumpapa Gims!',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'public')));
} else {
    const corsOptions = {
        origin: [
            'http://127.0.0.1:8080',
             'http://localhost:8080',
             'http://127.0.0.1:3000',
             'http://localhost:3000',
             'http://localhost:5173',
             'http://127.0.0.1:5173'
            ],
        credentials: true
    };
    app.use(cors(corsOptions));
}

const teamRoutes = require('./api/team/team.routes')
const projectRoutes = require('./api/project/project.routes')
const projectMembersRoutes = require('./api/projectMember/projectMember.routes')
const authRoutes = require('./api/auth/auth.routes')
const userRoutes = require('./api/user/user.routes')

const connectSockets = require('./api/socket/socket.routes')


// routes
app.use('/api/team', teamRoutes)
app.use('/api/project', projectRoutes)
app.use('/api/projectMember', projectMembersRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
connectSockets(io)

// app.get('/**', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// })

const logger = require('./services/logger.service')
const port = process.env.PORT || 3030;
http.listen(port, () => {
    logger.info(`Server is running on port: ${(!process.env.PORT && 'http://127.0.0.1:') + port}`)
});

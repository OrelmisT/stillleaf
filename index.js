import express from 'express'
import cors from 'cors'
import {dirname, join} from 'path'
import { fileURLToPath} from 'node:url';
import {Client} from 'pg'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

dotenv.config()

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    from:'stilleaf',
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASSWORD
    }
})


const salt_rounds = 10

const redisClient = createClient({url:process.env.REDIS_URI})
await redisClient.connect()


const db = new Client({connectionString:process.env.DB_URI})
db.connect()

const app = express()
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
const port=8500
const __dirname = dirname(fileURLToPath(import.meta.url))
app.use(express.static(join(__dirname, 'public')))
app.use(cookieParser())
app.use(session(
    {
        store: new RedisStore({client:redisClient}),
        secret:process.env.SESSION_SECRET,
        rolling: true,
        resave: false,
        saveUninitialized: false,
        cookie: {httpOnly: true, maxAge: 1000 * 60 * 60 *2, name:'user_session' }
    }
))



function formatDateStringToEST(input) {
        const date = new Date(input);

        const options = {
            timeZone: 'America/New_York',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZoneName: 'short',
        };

        const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(date);
        
        const month = parts.find(p => p.type === 'month').value;
        const day = parts.find(p => p.type === 'day').value;
        const hour = parts.find(p => p.type === 'hour').value;
        const minute = parts.find(p => p.type === 'minute').value;
        const dayPeriod = parts.find(p => p.type === 'dayPeriod').value;
        const zone = parts.find(p => p.type === 'timeZoneName').value;

        return `${month} ${day}, ${hour}:${minute} ${dayPeriod} ${zone}`;
}



// redirect to login if session not verified (form submission)
const verifySession_redirect = (req, res, next) => {
    if(req.session.user){
        next()
    }
    else{
        res.redirect('/login')
    }
}

// send error response to redirect on the client (json request)
const verifySession_error_msg = (req, res, next) => {
    if(req.session.user){
        next()
    }
    else{
        res.status(401).json({'error':'session expired'})
    }
}



app.get('/', (req, res) =>{
    if (req.session.user){
        res.redirect('/leaves')
        return
    }
    res.render('landing_page.ejs')
})



app.get('/login', (req, res)=> {
    if (req.session.user){
        res.redirect('/leaves')
        return  
    }
    res.render('login.ejs')
})

app.post('/login', async (req, res)=>{
    const email = req.body.email
    const password = req.body.password

    const response = await db.query('select * from accounts where accounts.email=$1', [email])
    if(response.rowCount === 0){
        res.render('login.ejs', {errorMessage:'No account with this email exists', email, password})
        return
    }
    const hashedPassword = response.rows[0].password
    let passwordIsCorrect = undefined
    try{
         passwordIsCorrect = await bcrypt.compare(password, hashedPassword)
    }catch(e){
        res.render('login.ejs', {errorMessage:'Something went wrong. Try again later', email, password})
        return
    }

    if(!passwordIsCorrect){
        res.render('login.ejs', {errorMessage:'Incorrect password.', email, password})
        return
    }

    req.session.user = {email, username:response.rows[0].username}
    res.redirect('/leaves')
})

app.get('/leaves', verifySession_redirect,  async (req, res) =>{
    const email = req.session.user.email
    const response = await db.query('select * from reflections where user_email = $1 order by last_modified_time_stamp desc',[email])
    const reflections = response.rows
    res.render('home.ejs', {reflections, 'formatDateStringToEST': formatDateStringToEST, 'user': req.session.user})

})

app.get('/signup', (req, res) => {
    if(req.session.user){
        res.redirect('/leaves')
        return
    }
    res.render('signup.ejs')
})

app.post('/signup', async (req, res) =>{
    const username = req.body.username
    const email = req.body.email
    const password = req.body.password
    

    const emailtMatchCount = (await db.query('select count(*) from accounts where accounts.email=$1', [email])).rows[0].count
    if(emailtMatchCount > 0){
        res.render('signup.ejs', {errorMessage:'An account using this email already exists', username, email, password})
        return
    }
    const usernameMatchCount = (await db.query('select count(*) from accounts where accounts.username=$1', [username])).rows[0].count
    if(usernameMatchCount > 0){
        res.render('signup.ejs', {errorMessage:"This username is taken", username, email, password})
        return
    }

    
    let password_hash = undefined

    try{
        password_hash = await bcrypt.hash(password, salt_rounds)
    }catch(e){
        res.render('signup.ejs', {errorMessage:'Something went wrong. Try again later'})
        return
    }
    const result = await db.query('insert into accounts values($1, $2, $3)', [email, username , password_hash])

    req.session.user = {username, email}
    res.redirect('/leaves')
})

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        res.clearCookie('user_session')
        res.redirect('/login')
    })
   
})


app.put('/reflections/:id', verifySession_error_msg , async (req, res)=>{

    console.log(req.body)
    

    const {email, username} = req.session.user
    const response = await db.query('select * from reflections where id = $1', [req.params.id])
    if (response.rowCount === 0){
        res.status(404).json({'error':'No reflection with this id exists'})
        return
    }
    if(email !== response.rows[0].user_email){
        res.status(401).json({'error':'Unauthorized'})
        return
    }

    // Do not update timestamp if neither the title nor the content have changed
    if(response.rows[0].content === req.body.content && response.rows[0].title === req.body.title){
        res.status(200).json({"message": "no change"})
        return
    }

    const updateResponse = await db.query('update reflections set title = $1, content = $2, last_modified_time_stamp = $3 where id = $4', [req.body.title, req.body.content, req.body.last_modified_time_stamp, req.params.id])

    res.status(200).json({"message":"reflection successfully updated"})


})

app.post('/reflections', verifySession_error_msg, async (req, res) => {
    const {title, content, timestamp} = req.body
    const user_email = req.session.user.email
    const insertResponse = await db.query('insert into reflections (user_email, content, title, creation_time_stamp, last_modified_time_stamp) values ($1, $2, $3, $4, $5) returning *', [user_email, content, title, timestamp, timestamp])

    res.status(201).json({'message':'reflection successfully created', 'reflection': insertResponse.rows[0]})


})

app.delete('/reflections/:id', verifySession_error_msg, async(req, res) =>{
    const response = await db.query('select * from reflections where id = $1', [req.params.id])
    if(response.rowCount === 0){
        res.status(404).json({'error': 'No reflection with this id exists'})
        return
    }
    if(req.session.user.email !== response.rows[0].user_email){
        res.status(401).json({"error": "Unauthorized"})
        return
    }

    const delete_response = await db.query('delete from reflections where id = $1', [req.params.id])
    res.status(200).json({'message':'reflection was successfully deleted'})

})


app.get('/request_password_reset', (req, res) =>{
    if (req.session.user){
        res.redirect('/leaves')
        return
    }

    res.render('password_reset_request.ejs')

})

app.post('/request_password_reset', async (req, res) => {

    console.log(process.env.EMAIL_USER)
    console.log(process.env.EMAIL_PASSWORD)
    console.log('route hit')
    const email = req.body.email
    const response = await db.query('select * from accounts where email = $1', [email])
    if(response.rowCount === 0){
        console.log("jeepers creepers")

        res.render('password_reset_request.ejs', {"email":email, errorMessage:"No account with this email exists"})
        return
    }


    const token = jwt.sign({email}, process.env.EMAIL_SECRET, {expiresIn:'15m'})

    const info = await transporter.sendMail({
        from:`"Stillleaf" <${process.env.EMAIL_USER}>`,
        to:email,
        subject:"Password Reset Link",
        html:`<p>Your password reset link: ${process.env.APP_DOMAIN}/password_reset?token=${token}</p>`
    })

    console.log(info)

    res.render('password_reset_request.ejs', {email_sent: true})


})


app.get('/password_reset', (req, res) =>{
    const token = req.query.token
    if(!token){
        res.render('resetpassword.ejs', {errorMessage:'Invalid reset link'})
        return
    }

    jwt.verify(token, process.env.EMAIL_SECRET, (err, data) =>{
        if(err){
            res.render('resetpassword.ejs', {errorMessage:"Invalid or expired reset link"})
        }else{
            res.render('resetpassword.ejs', {email:data.email})
        }
    })
})

app.post('/password_reset', async (req, res) => {
    const token = req.query.token
    if(!token){
        res.render('resetpassword.ejs', {errorMessage:'Invalid reset link'})
        return
    }
    let email = undefined
    await jwt.verify(token, process.env.EMAIL_SECRET, (err, data) =>{
        if(!err){
            email = data.email
        }else{
            res.render('resetpassword.ejs', {errorMessage:"Invalid or expired reset link"})
        }
    })
    const password = req.body.password
    const passwordHash = await bcrypt.hash(password, salt_rounds)
    const response = await db.query('update accounts  set password = $1 where email = $2 ', [passwordHash, email])
    res.render('resetpassword.ejs', {success:true})



})


// create tables if they do not already exist
const initializeTables = async() =>{
    
    // accounts 
    const accounts_response = await db.query("select exists(select 1 from information_schema.tables where table_name = 'accounts')")
    console.log(`accounts response:${accounts_response.rows[0].exists}`)
    if (!accounts_response.rows[0].exists){
        await db.query("create table accounts (email text primary key, username text, password text)")
    }
    // reflections
    const reflections_response = await db.query("select exists(select 1 from information_schema.tables where table_name = 'reflections')")
    if (!reflections_response.rows[0].exists){
        await db.query("create table reflections (id serial primary key, user_email text references accounts(email), content text, title text, creation_time_stamp timestamp, last_modified_time_stamp timestamp)")
    }
}


app.listen(port, async ()=>{
    await initializeTables()
    console.log(`App running at http://localhost:${port}`)
})
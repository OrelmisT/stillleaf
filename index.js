import express from 'express'
import cors from 'cors'
import {dirname, join} from 'path'
import { fileURLToPath, URLSearchParams } from 'node:url';
import {Client} from 'pg'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser';
import { NONAME } from 'node:dns';

dotenv.config()
const env = process.env
const db = new Client({connectionString:process.env.DB_URI})
db.connect()

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const port=8500
const __dirname = dirname(fileURLToPath(import.meta.url))
app.use(express.static(join(__dirname, 'public')))
// console.log(__dirname)
app.use(cookieParser())

const verifyAccessToken = (req, res, next) => {
    
    const cookies = req.cookies
    const accessToken = cookies?.access_jwt
    if(!accessToken){
        res.redirect('/login')
    }
    jwt.verify(accessToken, process.env.ACCESS_SECRET, (err, data) =>{
        if(err){
            res.cookie('access_jwt', undefined, {httpOnly:true, maxAge:0}).cookie('refresh_jwt', undefined, {httpOnly:true, maxAge:0}).redirect('/login')
        }else{
            req.email = data.email
            next()
        }
    })

}


app.get('/', (req, res) =>{
    res.redirect('/login')
})

app.get('/login', (req, res)=> {
    const cookies = req.cookies
    const token = cookies?.access_jwt
    if(token){
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

    const accessToken =  jwt.sign({email}, process.env.ACCESS_SECRET) 
    const refreshToken = jwt.sign({email}, process.env.REFRESH_SECRET)
    res.cookie('access_jwt', accessToken, {httpOnly:true}).cookie('refresh_jwt', refreshToken, {httpOnly:true}).redirect('/leaves')
})

app.get('/leaves', verifyAccessToken,  (req, res) =>{
    res.render('home.ejs')

})

app.get('/signup', (req, res) => {
    const cookies = req.cookies
    const token = cookies?.access_jwt
    if(token){
        res.redirect('/leaves')
        return
    }
    res.render('signup.ejs')
})

app.post('/signup', async (req, res) =>{
    const username = req.body.username
    const email = req.body.email
    const password = req.body.password
    const salt_rounds = 10

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
    const result = await db.query('insert into accounts values($1, $2, $3)', [username, email, password_hash])

    const accessToken =  jwt.sign({email}, process.env.ACCESS_SECRET) 
    const refreshToken = jwt.sign({email}, process.env.REFRESH_SECRET)
    res.cookie('access_jwt', accessToken, {httpOnly:true}).cookie('refresh_jwt', refreshToken, {httpOnly:true}).redirect('/leaves')
})

app.get('/logout', (req, res) => {
    res.cookie('access_jwt', undefined, {httpOnly:true, maxAge:0}).cookie('refresh_jwt', undefined, {httpOnly:true, maxAge:0})
    .redirect('/login')
})

app.listen(port, ()=>{
    console.log(`App running at http://localhost:${port}`)
})
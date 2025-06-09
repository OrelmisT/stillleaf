import express from 'express'
import cors from 'cors'
import {dirname, join} from 'path'
import { fileURLToPath, URLSearchParams } from 'node:url';
import {Client} from 'pg'
import dotenv from 'dotenv'

dotenv.config()
const env = process.env
console.log(`DB URI: ${process.env.DB_URI}`)
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

app.get('/', (req, res) =>{
    res.redirect('/login')
})

app.get('/login', (req, res)=> {
    res.render('login.ejs')
})

app.post('/login', (req, res)=>{
    console.log(req.body)
    res.redirect('/leaves')
})

app.get('/leaves', (req, res) =>{
    res.render('home.ejs')

})

app.get('/signup', (req, res) => {
    res.render('signup.ejs')
})

app.post('/signup', async (req, res) =>{
    console.log(req.body)
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

    const result = await db.query('insert into accounts values($1, $2, $3)', [username, email, password])

    res.redirect('/leaves')
})

app.listen(port, ()=>{
    console.log(`App running at http://localhost:${port}`)
})
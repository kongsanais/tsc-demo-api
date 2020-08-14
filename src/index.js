const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/R_user')
const app = express()
const cors = require('cors');
app.use(cors())


const port = process.env.PORT || 3000
app.use(express.json())
app.use(userRouter)
app.use(express.static(__dirname + "/uploaded"))



app.listen(port, () => {
    console.log('Server is up on port ' + port)
})


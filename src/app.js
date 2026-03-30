import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({
    limit: "16kb"
}))
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))
app.use(express.static("public"))
app.use(cookieParser());


//routes import
import userRouter from './routes/user.routes.js'

//instead of declaring the routes here, we are going to import them and use them as 
//middleware so, we pass the route and the middleware that we imported from "user.routes.js"
app.use("/api/v1/users", userRouter)
//here route is provided in teh userRouter and "...users " is just a prefix 
// http://localhost:8000/users/register

export { app }
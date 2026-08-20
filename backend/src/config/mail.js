import nodemailer from "nodemailer";
import { env } from "./env.js";

const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASSWORD
    },
})

export default transporter
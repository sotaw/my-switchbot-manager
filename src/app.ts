import express from 'express'
import axios from 'axios'
import dotenv from 'dotenv'

const app = express()
const router = express.Router()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.post('/switch', async (req: express.Request, res: express.Response) => {
    const body = req.body as { token: string }
    if (body.token !== process.env.AUTH_TOKEN) {
        res.status(401).send("invalid token")
        return
    }

    let status = undefined

    try {
        status = (await axios.get(
            `https://api.switch-bot.com/v1.0/devices/${process.env.DEVICE_ID}/status`,
            {
                headers: {
                    authorization: process.env.SWITCHBOT_TOKEN
                }
            }
        )).data as { body: { power: string } }
    } catch {
        res.status(500).send(" cannot get device status")
        return
    }

    try {
        if (status.body.power == "on") {
            await axios.post(
                `https://api.switch-bot.com/v1.0/devices/${process.env.DEVICE_ID}/commands`,
                {command: "turnOff", parameter: "default", commandType: "command"},
                {
                    headers: {
                        authorization: process.env.SWITCHBOT_TOKEN
                    },
                }
            )
        } else {
            await axios.post(
                `https://api.switch-bot.com/v1.0/devices/${process.env.DEVICE_ID}/commands`,
                {command: "turnOn", parameter: "default", commandType: "command"},
                {
                    headers: {
                        authorization: process.env.SWITCHBOT_TOKEN
                    }
                }
            )
        }
    } catch {
        res.status(500).send(" cannot command device")
        return
    }

    res.send("success")
})

app.use('/', router)

export default app
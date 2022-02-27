import express from 'express'
import axios from 'axios'
import {TRequestType, TPlugStatus} from "~/types/common"

const app = express()
const router = express.Router()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.post('/plug/toggle', async (req: express.Request, res: express.Response) => {
    const body = req.body as TRequestType

    // valid
    if (body.token.length == 0) {
        res.status(400).send('token is required')
        return
    }
    if (body.deviceId.length == 0) {
        res.status(400).send('deviceId is required')
        return
    }

    // fetch current status
    let plugStatus: 'on' | 'off' | undefined
    try {
        const response = (await axios.get(
            `https://api.switch-bot.com/v1.0/devices/${body.deviceId}/status`,
            {
                headers: {
                    authorization: body.token
                }
            }
        )).data as TPlugStatus

        // valid device type
        if (response.body.deviceType !== 'Plug') {
            res.status(400).send('invalid device type')
            return
        }
        plugStatus = response.body.power

    } catch {
        res.status(400).send('cannot get device status')
        return
    }

    // send command
    try {
        await axios.post(
            `https://api.switch-bot.com/v1.0/devices/${process.env.DEVICE_ID}/commands`,
            { command: plugStatus == 'on' ? 'turnOff' : 'turnOn', parameter: "default", commandType: "command" },
            {
                headers: {
                    authorization: body.token
                },
            }
        )
    } catch {
        res.status(400).send('cannot send command')
        return
    }

    res.send({ status: 'success' })
})

app.use('/', router)

export default app
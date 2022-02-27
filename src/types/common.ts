export type TRequestType = {
    token: string,
    deviceId: string,
}

export type TPlugStatus = {
    statusCode: number
    body: {
        deviceId: string,
        deviceType: string,
        hubDeviceId: string,
        power: 'on' | 'off',
    },
    message: string
}
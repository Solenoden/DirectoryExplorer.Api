/* eslint-disable no-console */
import express from 'express'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import cors from 'cors'
import http from 'http'
import { EndpointControllerInterface } from './interfaces/endpoint-controller.interface'
import { DirectoryController } from './controllers/directory.controller'

const app = express()
const server = http.createServer(app)

app.use(morgan('dev'))
app.use(cors())
app.use(
    bodyParser.urlencoded({
        extended: false,
    }),
)
app.use(
    bodyParser.json({
        limit: '2mb'
    }),
)
app.use(
    bodyParser.raw({
        type: 'application/octet-stream',
        limit: '5mb',
    }),
)
app.use(
    bodyParser.raw({
        type: 'image/*',
        limit: '5mb',
    }),
)

const endpointControllers: EndpointControllerInterface[] = [
    new DirectoryController()
]
endpointControllers.forEach(controller => controller.registerEndpoints(app))

const port = process.env.PORT || 3000
server.listen(port)
console.warn('processId:' + process.pid.toString() + ' - App Running on port: ' + port.toString())
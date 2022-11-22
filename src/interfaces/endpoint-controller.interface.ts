import { Express } from 'express'

export interface EndpointControllerInterface {
    registerEndpoints(app: Express): void
}
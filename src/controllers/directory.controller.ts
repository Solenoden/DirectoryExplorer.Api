import { EndpointControllerInterface } from '../interfaces/endpoint-controller.interface'
import { Express, Request, RequestHandler, Response } from 'express'
import { DirectoryService } from '../services/directory.service'
import { ErrorHandlerService } from '../services/error-handler.service'

export class DirectoryController implements EndpointControllerInterface {
    private readonly directoryService = new DirectoryService()
    private readonly errorHandlerService = new ErrorHandlerService()

    registerEndpoints(app: Express): void {
        app.get('/api/v1/directory', this.getDirectories.bind(this) as RequestHandler)
    }

    private async getDirectories(request: Request, response: Response): Promise<void> {
        try {
            const directoryPath = request.query.path as string
            const files = await this.directoryService.getDirectory(directoryPath)
            response.status(200).send(files)
        } catch (error) {
            this.errorHandlerService.handleError(response, error)
        }
    }
}
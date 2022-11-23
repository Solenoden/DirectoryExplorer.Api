import { HttpError, UnexpectedError } from '../errors/app-errors'
import { Response } from 'express'

export class ErrorHandlerService {
    public handleError(response: Response, error: any): void {
        if (error && error instanceof HttpError) {
            response.statusCode = error.statusCode
            response.send({ error: error, errorMessage: error.message })
            return
        }

        const unexpectedError = new UnexpectedError(error, this.constructor.name)
        // eslint-disable-next-line
        unexpectedError.originalError = unexpectedError.originalError.toString()
        response.statusCode = unexpectedError.statusCode
        response.send({ error: unexpectedError, errorMessage: unexpectedError.message })
    }
}

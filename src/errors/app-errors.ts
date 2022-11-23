export class HttpError implements Error {
    name: string
    message: string
    statusCode: number
    originalError: any
    origin: string

    constructor(message: string, statusCode: number, originalError: any, origin: string) {
        this.name = this.constructor.name
        this.message = message
        this.statusCode = statusCode
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.originalError = originalError
        this.origin = origin
    }
}

export class UnexpectedError extends HttpError {
    constructor(public originalError: any, origin: string) {
        super('An unexpected error occurred. Please try again later.', 500, originalError, origin)
    }
}
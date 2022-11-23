import { Directory } from '../models/directory.model'
import { WorkerService } from './worker.service'
import { WorkerFile } from '../enums/worker-file.enum'
import { WorkerOperation } from '../enums/worker-operation.enum'

export class DirectoryService {
    private readonly exposedDirectoriesRoot = process.env.EXPOSED_DIRECTORIES_ROOT || '.'
    private readonly workerService = new WorkerService()

    public async getDirectory(path = '/', directory: Directory = null): Promise<Directory> {
        return new Promise<Directory>((resolve, reject) => {
            const fullPath = this.formatPath(this.exposedDirectoriesRoot + '/' + path)
            if (!directory) {
                directory = new Directory()
                directory.name = fullPath
                directory.fullPath = fullPath
            }

            const worker = this.workerService.createWorkerThread(
                WorkerFile.Directory,
                WorkerOperation.ReadDirectory,
                { directoryPath: fullPath }
            )

            worker.once('message', (result: { directory: Directory }) => {
                if (result.directory.directories.length === 0) {
                    resolve(result.directory)
                    return
                }

                const getDirectoryPromises = result.directory.directories.map(
                    currentDirectory => this.getDirectory(path + currentDirectory.name, directory)
                )
                Promise.all(getDirectoryPromises).then(directories => {
                    directory.directories.push(...directories)
                    resolve(directory)
                }).catch(error => {
                    reject(error)
                })
            })
        })
    }

    public formatPath(path: string): string {
        return path
            .replace(/\\/g, '/')
            .replace(/\/{2,}/g, '/')
    }

    public getFileExtension(fileName: string): string | null {
        const fileNameParts = fileName.split('.')
        if (fileNameParts.length > 1) {
            return fileNameParts[fileNameParts.length - 1]
        }

        return null
    }
}
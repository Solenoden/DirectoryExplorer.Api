import { Directory } from '../models/directory.model'
import { WorkerService } from './worker.service'
import { WorkerFile } from '../enums/worker-file.enum'
import { WorkerOperation } from '../enums/worker-operation.enum'
import { DirectoryItem } from '../models/directory-item.model'
import { File } from '../models/file.model'

export class DirectoryService {
    private readonly exposedDirectoriesRoot = process.env.EXPOSED_DIRECTORIES_ROOT || '.'
    private readonly directoryResultDepth = process.env.DIRECTORY_RESULT_DEPTH || 1
    private readonly workerService = new WorkerService()

    public async getDirectory(
        rootPath: string = null,
        directory: Directory = null,
        recursiveCallCount = 0
    ): Promise<Directory> {
        return new Promise<Directory>((resolve, reject) => {
            if (!directory) {
                const fullPath = this.formatPath(rootPath ? rootPath : this.exposedDirectoriesRoot + '/')
                directory = new Directory()
                directory.name = fullPath
                directory.fullPath = fullPath
            }

            const worker = this.workerService.createWorkerThread(
                WorkerFile.Directory,
                WorkerOperation.ReadDirectory,
                { directoryPath: directory.fullPath }
            )

            worker.once('message', (result: { directory: Directory }) => {
                if (result.directory.directories.length === 0) {
                    result.directory.isDeadEnd = true
                    resolve(result.directory)
                    return
                }

                result.directory.directories = this.sortDirectoryItems<Directory>(result.directory.directories)
                result.directory.files = this.sortDirectoryItems<File>(result.directory.files)

                if (recursiveCallCount >= this.directoryResultDepth) {
                    resolve(result.directory)
                    return
                }

                recursiveCallCount++
                const getDirectoryPromises = result.directory.directories.map(
                    currentDirectory => this.getDirectory(null, currentDirectory, recursiveCallCount)
                )
                Promise.all(getDirectoryPromises).then(directories => {
                    directory.directories.push(...directories)
                    directory.files.push(...result.directory.files)
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

    private sortDirectoryItems<T extends DirectoryItem>(directories: T[]): T[] {
        return directories.sort((current, next) => {
            if (current.name > next.name) return 1
            if (current.name < next.name) return -1

            return 0
        })
    }
}
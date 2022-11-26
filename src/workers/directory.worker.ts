import { isMainThread, parentPort, Worker, workerData } from 'worker_threads'
import * as fileSystem from 'fs'
import { WorkerData } from '../interfaces/worker-data.interface'
import { WorkerOperation } from '../enums/worker-operation.enum'
import { Directory } from '../models/directory.model'
import { DirectoryService } from '../services/directory.service'
import { File } from '../models/file.model'
import { DirectoryItem } from '../models/directory-item.model'
import { WorkerService } from '../services/worker.service'
import { WorkerFile } from '../enums/worker-file.enum'

/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
if (!isMainThread && workerData && workerData.operation) {
    const data = workerData as WorkerData

    switch (data.operation) {
    case WorkerOperation.ReadDirectory:
        void readDirectory()
        break
    case WorkerOperation.ReadFileStats:
        void readFileStats()
        break
    }
}

async function readDirectory(): Promise<void> {
    const payload = workerData.payload as { directoryPath: string }
    // eslint-disable-next-line no-console
    console.log(`worker - readDirectory - ${payload.directoryPath}`)
    const directoryService = new DirectoryService()
    const workerService = new WorkerService()

    const directory = new Directory()
    directory.fullPath = payload.directoryPath

    const pathParts = directory.fullPath.split('/').filter(x => !!x && x !== '')
    directory.name = pathParts[pathParts.length - 1]

    if (payload.directoryPath) {
        const workers: Worker[] = []
        const items = await fileSystem.promises.readdir(payload.directoryPath)

        if (items.length === 0) {
            parentPort.postMessage({ directory })
            process.exit()
            return
        }

        items.forEach(currentItem => {
            const directoryItem = new DirectoryItem()
            directoryItem.name = currentItem
            directoryItem.fullPath = directoryService.formatPath(payload.directoryPath + '/' + currentItem)

            workers.push(workerService.createWorkerThread(
                WorkerFile.Directory, 
                WorkerOperation.ReadFileStats, 
                { directoryItem }
            ))
        })

        let completedWorkers = 0
        workers.forEach(worker => {
            worker.once('message', (result: { file?: File, directory?: Directory }) => {
                completedWorkers++

                if (result) {
                    if (result.file) {
                        directory.files.push(result.file)
                    } else if (result.directory) {
                        directory.directories.push(result.directory)
                    }
                }

                if (completedWorkers === workers.length) {
                    parentPort.postMessage({ directory })
                    process.exit()
                }
            })
        })
    }
}

async function readFileStats(): Promise<void> {
    const directoryService = new DirectoryService()
    const payload = workerData.payload as { directoryItem: DirectoryItem }
    // eslint-disable-next-line no-console
    console.log(`worker - readFileStats - ${payload.directoryItem.fullPath}`)
    const fileStats = await fileSystem.promises.stat(payload.directoryItem.fullPath)

    payload.directoryItem.creationDateEpoch = Math.floor(fileStats.birthtimeMs)
    payload.directoryItem.modificationDateEpoch = Math.floor(fileStats.mtimeMs)
    payload.directoryItem.sizeInKilobytes = fileStats.size / 1000

    if (fileStats.isFile()) {
        const file = new File(payload.directoryItem)
        file.extension = directoryService.getFileExtension(payload.directoryItem.name)

        parentPort.postMessage({ file })
    } else {
        const subDirectory = new Directory(payload.directoryItem)

        parentPort.postMessage({ directory: subDirectory })
    }
}
import { isMainThread, parentPort, workerData } from 'worker_threads'
import * as fileSystem from 'fs'
import { WorkerData } from '../interfaces/worker-data.interface'
import { WorkerOperation } from '../enums/worker-operation.enum'
import { Directory } from '../models/directory.model'
import { DirectoryService } from '../services/directory.service'
import { File } from '../models/file.model'

/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
if (!isMainThread && workerData && workerData.operation) {
    const data = workerData as WorkerData

    switch (data.operation) {
    case WorkerOperation.ReadDirectory:
        void readDirectory()
        break
    }
}

async function readDirectory() {
    const payload = workerData.payload as { directoryPath: string }
    const directoryService = new DirectoryService()

    const directory = new Directory()
    directory.fullPath = payload.directoryPath

    const pathParts = directory.fullPath.split('/').filter(x => !!x && x !== '')
    directory.name = pathParts[pathParts.length - 1]

    if (payload.directoryPath) {
        const directoryItems = await fileSystem.promises.readdir(payload.directoryPath)
        directoryItems.forEach(currentItem => {
            const extension = directoryService.getFileExtension(currentItem)
            const itemPath = directoryService.formatPath(payload.directoryPath + '/' + currentItem)
            const isFile = !!extension

            if (isFile) {
                const file = new File()
                file.name = currentItem
                file.fullPath = itemPath
                file.extension = extension
                directory.files.push(file)
            } else {
                const subDirectory = new Directory()
                subDirectory.name = currentItem
                subDirectory.fullPath = itemPath
                directory.directories.push(subDirectory)
            }
        })

        const getFileInfoPromises = directory.files.map(file => getFileInformation(file))
        directory.files = await Promise.all(getFileInfoPromises)
    }

    parentPort.postMessage({ directory })
    process.exit()
}

async function getFileInformation(file: File): Promise<File> {
    // TODO: Get file permissions
    const fileStats = await fileSystem.promises.stat(file.fullPath)
    file.creationDateEpoch = Math.floor(fileStats.birthtimeMs)
    file.modificationDateEpoch = Math.floor(fileStats.mtimeMs)
    file.sizeInKilobytes = fileStats.size / 1000

    return file
}
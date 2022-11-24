import { isMainThread, parentPort, workerData } from 'worker_threads'
import * as fileSystem from 'fs'
import { WorkerData } from '../interfaces/worker-data.interface'
import { WorkerOperation } from '../enums/worker-operation.enum'
import { Directory } from '../models/directory.model'
import { DirectoryService } from '../services/directory.service'
import { File } from '../models/file.model'
import { DirectoryItem } from '../models/directory-item.model'

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
        const directoryItems: DirectoryItem[] = []
        const directoryItemStatPromises: Promise<fileSystem.Stats>[] = []

        const result = await fileSystem.promises.readdir(payload.directoryPath)
        result.forEach(currentItem => {
            const directoryItem = new DirectoryItem()
            directoryItem.name = currentItem
            directoryItem.fullPath = directoryService.formatPath(payload.directoryPath + '/' + currentItem)
            directoryItems.push(directoryItem)

            // TODO: Get file permissions
            // TODO: Spin up a thread per directory item for stat read
            directoryItemStatPromises.push(fileSystem.promises.stat(directoryItem.fullPath))
        })

        const statResults = await Promise.all(directoryItemStatPromises)
        statResults.forEach((statResult, index) => {
            const directoryItem = directoryItems[index]
            directoryItem.creationDateEpoch = Math.floor(statResult.birthtimeMs)
            directoryItem.modificationDateEpoch = Math.floor(statResult.mtimeMs)
            directoryItem.sizeInKilobytes = statResult.size / 1000

            if (statResult.isFile()) {
                const file = new File(directoryItem)
                file.extension = directoryService.getFileExtension(directoryItem.name)
                directory.files.push(file)
            } else {
                const subDirectory = new Directory(directoryItem)
                directory.directories.push(subDirectory)
            }
        })
    }

    parentPort.postMessage({ directory })
    process.exit()
}
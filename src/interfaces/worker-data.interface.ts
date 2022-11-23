import { WorkerFile } from '../enums/worker-file.enum'
import { WorkerOperation } from '../enums/worker-operation.enum'

export interface WorkerData {
    file: WorkerFile,
    operation: WorkerOperation,
    payload: { [key: string]: any }
}
import { File } from './file.model'

export class Directory {
    name: string
    fullPath: string
    files: File[]
    directories: Directory[]

    constructor() {
        this.files = []
        this.directories = []
    }
}
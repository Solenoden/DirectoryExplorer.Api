import { DirectoryItem } from './directory-item.model'

export class File extends DirectoryItem {
    extension: string

    /* eslint-disable @typescript-eslint/no-unsafe-assignment */
    constructor(jsonObject?: { [key: string]: any }) {
        super(jsonObject)
        this.extension = jsonObject?.extension
    }
}
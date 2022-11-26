import { File } from './file.model'
import { DirectoryItem } from './directory-item.model'

export class Directory extends DirectoryItem {
    files: File[]
    directories: Directory[]
    isDeadEnd: boolean

    /* eslint-disable @typescript-eslint/no-unsafe-assignment,
    @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
    constructor(jsonObject?: { [key: string]: any }) {
        super(jsonObject)
        this.directories = jsonObject?.directories?.map((x: { [key: string]: any }) => new Directory(x)) || []
        this.files = jsonObject?.files?.map((x: { [key: string]: any }) => new File(x)) || []
        this.isDeadEnd = jsonObject?.isDeadEnd
    }
}
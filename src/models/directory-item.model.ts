export class DirectoryItem {
    name: string
    fullPath: string
    creationDateEpoch: number
    modificationDateEpoch: number
    sizeInKilobytes: number

    /* eslint-disable @typescript-eslint/no-unsafe-assignment */
    constructor(jsonObject?: { [key: string]: any }) {
        this.name = jsonObject?.name
        this.fullPath = jsonObject?.fullPath
        this.creationDateEpoch = jsonObject?.creationDateEpoch
        this.modificationDateEpoch = jsonObject?.modificationDateEpoch
        this.sizeInKilobytes = jsonObject?.sizeInKilobytes
    }
}
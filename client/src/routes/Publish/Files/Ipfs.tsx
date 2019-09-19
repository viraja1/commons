/* eslint-disable no-console */
import React, { useState, useEffect } from 'react'
import useIpfsApi, { IpfsConfig } from '../../../hooks/use-ipfs-api'
import Label from '../../../components/atoms/Form/Label'
import Spinner from '../../../components/atoms/Spinner'
import Dropzone from '../../../components/molecules/Dropzone'
import { formatBytes, pingUrl, readFileAsync } from '../../../utils/utils'
import { ipfsGatewayUri } from '../../../config'
import styles from './Ipfs.module.scss'

const config: IpfsConfig = {
    host: 'ipfs.infura.io',
    port: '5001',
    protocol: 'https'
}

export default function Ipfs({ addFile }: { addFile(url: string): void }) {
    const {
        ipfs,
        ipfsVersion,
        isIpfsReady,
        ipfsError,
        ipfsMessage
    } = useIpfsApi(config)

    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [fileSize, setFileSize] = useState('')
    const [fileSizeReceived, setFileSizeReceived] = useState('')

    useEffect(() => {
        setMessage(
            `Adding to IPFS<br />
             <small>${fileSizeReceived || 0}/${fileSize}</small><br />`
        )
    })

    async function addToIpfs(data: any) {
        try {
            const response = await ipfs.add(data, {
                wrapWithDirectory: true,
                progress: (length: number) => {
                    console.log(`Received: ${formatBytes(length, 0)}`)
                    setFileSizeReceived(formatBytes(length, 0))
                }
            })

            // CID of wrapping directory is returned last
            const cid = response[response.length - 1].hash
            console.log(`File added: ${cid}`)
            return cid
        } catch (error) {
            console.error(`Adding to IPFS failed: ${error.message}`)
            setLoading(false)
        }
    }

    async function handleOnDrop(acceptedFiles: File[]) {
        if (!acceptedFiles[0]) return

        const { name, size } = acceptedFiles[0]
        const totalSize = formatBytes(size, 0)

        setLoading(true)
        setFileSize(totalSize)

        // Add file to IPFS node
        const content: any = await readFileAsync(acceptedFiles[0])
        const data = Buffer.from(content)
        const fileDetails = {
            path: name,
            content: data
        }

        const cid = await addToIpfs(fileDetails)
        if (!cid) return

        // Ping gateway url to make it globally available,
        // but store native url in DDO.
        const urlGateway = `${ipfsGatewayUri}/ipfs/${cid}/${name}`
        const url = `ipfs://${cid}/${name}`

        setMessage('Checking IPFS gateway URL')
        await pingUrl(urlGateway)

        // add IPFS url to file.url
        addFile(url)
    }

    return (
        <div className={styles.ipfsForm}>
            <Label htmlFor="fileUpload" required>
                Add File To IPFS
            </Label>
            {loading ? (
                <Spinner message={message} />
            ) : (
                <Dropzone
                    multiple={false}
                    handleOnDrop={handleOnDrop}
                    disabled={!isIpfsReady}
                />
            )}
            {ipfsMessage !== '' && (
                <div className={styles.message} title={ipfsVersion}>
                    {ipfsMessage}
                </div>
            )}
            {ipfsError && <div className={styles.error}>{ipfsError}</div>}
        </div>
    )
}

import { Duplex, DuplexOptions } from 'stream'
import { createConnection, createProtocolConnection } from 'vscode-languageserver/node'
import CSSLanguageServer, { Settings } from '../src'

export function connect(settings?: Settings) {
    const duplexOptions = {
        write(chunk, encoding, callback) {
            this.emit('data', chunk)
            callback()
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        read() {}
    } as DuplexOptions
    const input = new Duplex(duplexOptions)
    const output = new Duplex(duplexOptions)
    const serverConnection = createConnection(input, output)
    const clientConnection = createProtocolConnection(output, input)
    const server = new CSSLanguageServer(serverConnection, settings)
    server.start()
    clientConnection.listen()
    return {
        server,
        clientConnection,
        serverConnection,
    }
}
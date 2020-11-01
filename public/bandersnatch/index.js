const MANIFEST_URL = 'manifest.json';
const localHost = ['127.0.0.1' , 'localhost']

async function main() {
    
    // verifica a url
    const isLocal = !!~localHost.indexOf(window.location.hostname);
    console.log('isLocal', isLocal);
    console.log('até aqui ok!!!!')
    const manifestJSON = await ( await fetch( MANIFEST_URL )).json();
    const host = isLocal ? manifestJSON.localHost : manifestJSON.productionHost;
    const videoComponent = new VideoComponent()

    const network = new NetWork({ host })

    const videoPlayer = new VideoMediaPlayer({
        manifestJSON,
        network,
        videoComponent
    })

    videoPlayer.initializeCodec()
    videoComponent.inicializePlayer()

    window.nextChunk = ( data ) => videoPlayer.nextChunk( data )
}

window.onload = main
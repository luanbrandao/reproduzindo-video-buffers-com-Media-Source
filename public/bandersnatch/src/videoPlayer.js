class VideoMediaPlayer {

    constructor({ manifestJSON, network }) {
        this.manifestJSON = manifestJSON;
        this.netWork = network;
        this.videoElement = null;
        this.sourceBuffer = null;
        this.selected = {};
        this.videoDuration = 0;
    }

    initializeCodec() {
        console.log('initializeCodec')
        this.videoElement = document.getElementById("vid");
        const mediaSourceSupported = !!window.MediaSource;
        if (!mediaSourceSupported) {
            alert("Seu browser ou sistema não tem suporte a MSE!")
            return;
        }

        const codecSupported = MediaSource.isTypeSupported(this.manifestJSON.codec);
        if (!codecSupported) {
            alert(`Seu browser não suporta o codec: ${this.manifestJSON.codec}`)
            return;
        }

        // 
        const mediaSource = new MediaSource();
        this.videoElement.src = URL.createObjectURL(mediaSource)
        
        mediaSource.addEventListener("sourceopen", this.sourceOpenWrapper(mediaSource) )
    }

        sourceOpenWrapper(mediaSource) {
            return async(_) => {
                this.sourceBuffer = mediaSource.addSourceBuffer(this.manifestJSON.codec)
                const selected = this.selected = this.manifestJSON.intro;
                mediaSource.duration = this.videoDuration;
                await this.fileDownload(selected.url);
                
            }
        }

    async fileDownload(url) {
        const prepareUrl =  {
            url,
            fileResolution: 360,
            fileResolutionTag: this.manifestJSON.fileResolutionTag,
            hostTag: this.manifestJSON.hostTag
        }

        const finalUrl = this.netWork.parseManifestURL(prepareUrl);

        this.setVideoPlayerDuration(finalUrl);
        console.log("finalURL", finalUrl);
        console.log("duration", this.videoDuration);
        const data = await this.netWork.fetchFile( finalUrl );
        return this.proccessBufferSegments(data);

    }

    setVideoPlayerDuration( finalURL ){
        const bars = finalURL.split('/');
        const [name, videoDuration] = bars[bars.length -1].split('-')
        this.videoDuration += videoDuration
    }

    // tem que esperar atualizar tudo
    async proccessBufferSegments( allSegments ){
        const sourceBuffer = this.sourceBuffer;
        sourceBuffer.appendBuffer( allSegments );

        return new Promise( (resolve,reject) => {
            // remove o evento
            const updateEnd = (_) => {
                sourceBuffer.removeEventListener("updateend", updateEnd);
                sourceBuffer.timestampOffset = this.videoDuration;

                return resolve();
            }

            sourceBuffer.addEventListener("updateend",  updateEnd )
            sourceBuffer.addEventListener("error", reject);
        })
    }

}
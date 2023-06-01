import React from 'react';
import { useParams } from 'react-router';
import ImageAnnotator from './image/ImageAnnotator';
import TextAnnotator from './text/TextAnnotator';
import VideoAnnotator from './video/VideoAnnotator';
import { BACKEND_ERR } from './utils/Errors';
import AudioAnnotator from './audio/AudioAnnotator';
import { BACKEND_URL } from './Api';


function MediaAnnotator({ triggerSnackbar }) {
    const id = useParams()["*"]
    const [type, setType] = React.useState(undefined)

    React.useEffect(() => {
        async function fetchMedia() {
            var response = await fetch(BACKEND_URL + "/" + id)
                .catch(() => triggerSnackbar(BACKEND_ERR, "error"))
            if (response === undefined) return
            setType(response.headers.get("Content-Type"))
        }
        fetchMedia().then();

        return () => { }
    }, [])

    return (
        <>
            {type && type.startsWith("text/plain") && <TextAnnotator triggerSnackbar={triggerSnackbar} id={id} />}
            {type === "image/jpeg" && <ImageAnnotator triggerSnackbar={triggerSnackbar} id={id} />}
            {type === "image/png" && <ImageAnnotator triggerSnackbar={triggerSnackbar} id={id} />}
            {type === "video/webm" && <VideoAnnotator triggerSnackbar={triggerSnackbar} id={id} />}
            {type === "audio/webm" && <AudioAnnotator triggerSnackbar={triggerSnackbar} id={id} />}
        </>
    );
}

export default MediaAnnotator;
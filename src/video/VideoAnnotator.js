import React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import VideoTimeAnnotator from './VideoTimeAnnotator';
import VideoRotoscopeAnnotator from './VideoRotoscopeAnnotator';
import VideoShapeAnnotator from './VideoShapeAnnotator';
import { useNavigate } from 'react-router';
import { CircularProgress } from '@mui/material';
import {BACKEND_URL, MEGRA_CON_URL} from '../Api';
import {BACKEND_ERR, MEGRA_CON_ERR} from '../utils/Errors';


function VideoAnnotator({ triggerSnackbar, id }) {
    const navigate = useNavigate();

    const [loading, setLoading] = React.useState();
    const [type, setType] = React.useState();

    const putVideoEmbedding = async (video_segment_url) => {
        const requestBody = [video_segment_url];
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        };
        const url = new URL(`${MEGRA_CON_URL}/put/embeddings`);
        url.searchParams.append('media_type', "video");
        await fetch(url.toString(), requestOptions).catch(() => triggerSnackbar(MEGRA_CON_ERR, "error"));
    }

    const segmentWithEmbedding = async (url) => {
        setLoading(true)
        let response = await fetch(url).catch(() => triggerSnackbar(BACKEND_ERR, "error"))
        await putVideoEmbedding(response.url)
        if (response.ok) {
            setLoading(false)
            navigate(response.url.replace(BACKEND_URL, ""))
        }
    }

    const segment = async (url) => {
        setLoading(true)
        let response = await fetch(url).catch(() => triggerSnackbar(BACKEND_ERR, "error"))
        if (response.ok) {
            setLoading(false)
            navigate(response.url.replace(BACKEND_URL, ""))
        }
    }

    return (
        <>
            <div className='App-title'>
                Video Annotation
                <div className='App-subtitle'>Define new segments of a video.</div>
            </div>
            <div className="App-content">
                {loading ? <CircularProgress /> :
                    <>
                        {!type &&
                            <Stack spacing={2} direction="row">
                                <Button variant='contained' onClick={() => setType("time")}>Time</Button>
                                <Button variant='contained' onClick={() => setType("shape")}>Shape</Button>
                                <Button variant='contained' onClick={() => setType("rotoscope")}>Rotoscope</Button>
                            </Stack>
                        }
                        {type === "time" && <VideoTimeAnnotator id={id} segment={segment} />}
                        {type === "shape" && <VideoShapeAnnotator id={id} segment={segment} />}
                        {type === "rotoscope" && <VideoRotoscopeAnnotator id={id} segment={segmentWithEmbedding} />}
                    </>
                }
            </div>
        </>
    );
}

export default VideoAnnotator;
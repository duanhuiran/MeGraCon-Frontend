import { Autocomplete, Grid, Paper, TextField } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router";
import FileDisplay from "./file_management/FileDisplay";
import { BACKEND_ERR } from "./utils/Errors";
import { BACKEND_URL } from "./Api";


const Library = ({ triggerSnackbar }) => {
    const navigate = useNavigate();

    const [loading, setLoading] = React.useState(true);
    const [media, setMedia] = React.useState([])
    const [mediaTypes, setMediaTypes] = React.useState([])
    const [selectedType, setSelected] = React.useState()


    const mimeToMediaType = new Map([
        ["image/jpeg", "Image"],
        ["image/png", "Image"],
        ["text/plain", "Text"],
        ["video/webm", "Video"],
        ["audio/webm", "Audio"],
    ])

    React.useEffect(() => {
        async function fetchMedia() {
            let options = {
                method: 'POST',
                body: JSON.stringify({
                    "quadValue": "<http://megras.org/schema#rawId>"
                })
            };
            let response = await fetch(BACKEND_URL + "/query/predicate", options)
                .catch(() => triggerSnackbar(BACKEND_ERR, "error"));
            if (response === undefined) return
            let uris = await response.json()

            options = {
                method: 'POST',
                body: JSON.stringify({
                    "s": uris.results.map(d => d.s),
                    "p": ["<http://megras.org/schema#canonicalMimeType>"],
                    "o": []
                })
            }
            response = await fetch(BACKEND_URL + "/query/quads", options)
                .catch(() => triggerSnackbar(BACKEND_ERR, "error"))
            if (response === undefined) return
            let mimetypeResults = await response.json()

            let mimetypes = mimetypeResults.results.map(m => mimeToMediaType.get(m.o.replace("^^String", "")))
            setMediaTypes([...new Set(mimetypes)])

            if (!ignore) {
                let mediaArray = mimetypeResults.results.map(d => ({
                    url: d.s.replace("<", "").replace(">", ""),
                    type: d.o.replace("^^String", "")
                }))
                setMedia(mediaArray)
                setLoading(false)
            }
        }
        let ignore = false;
        fetchMedia().then();
        return () => {
            ignore = true;
        }
    }, [])

    return (
        <>
            <div className='App-title'>
                My Library
                <Autocomplete
                    className='App-subtitle'
                    disablePortal
                    options={mediaTypes}
                    getOptionLabel={(option) => option}
                    sx={{ width: 300 }}
                    onChange={(e, v) => setSelected(v)}
                    renderInput={(params) => <TextField {...params} label="Media Type" />}
                />
            </div>
            <div className="App-content">
                <Grid
                    container
                    maxWidth={'60vw'}
                    justifyContent='center'
                    alignItems='center'
                    spacing={2}
                >
                    {media.map((m, i) => {
                        return (
                            !selectedType || mimeToMediaType.get(m.type) === selectedType ?
                                <Grid key={i} item xs={2}>
                                    <Paper elevation={3} onClick={() => navigate(m.url.replace(BACKEND_URL, ""))} sx={{ height: '16vh', cursor: 'pointer' }}>
                                        <FileDisplay
                                            isPreview={true}
                                            filedata={m.url}
                                            filetype={m.type}
                                        />
                                    </Paper>
                                </Grid>
                                : null
                        )
                    })}
                </Grid>
            </div >
        </>
    )
}

export default Library;
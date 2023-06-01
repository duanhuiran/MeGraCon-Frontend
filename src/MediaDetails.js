import {
    Menu, MenuItem, Box, Button, Chip, CircularProgress, IconButton, Paper, Stack, Table,
    TableBody, TableCell, TableContainer, TableRow, TextField
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import React, {useState} from 'react';
import { useLocation, useParams } from 'react-router';
import { useNavigate } from "react-router";

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import {createTheme, ThemeProvider} from "@mui/material/styles";

import MediaSegmentDetails from './MediaSegmentDetails';
import ImageSegmentDetails from './image/ImageSegmentDetails';
import TextSegmentDetails from './text/TextSegmentDetails';
import {BACKEND_ERR, MEGRA_CON_ERR} from './utils/Errors';
import {BACKEND_URL, MEGRA_CON_URL} from './Api';
import FileDisplay from './file_management/FileDisplay';
import WikiLinkWithPreview from "./reuse_components/WikilinkPreview";
import {SegmentGenerateButton} from "./reuse_components/SegmentGenerateButton";

import FuzzySearch from "./text/WikiFuzzySearch";
import TripletDisplay from "./file_management/TripletDisplay";
import {SegmentFusionButton} from "./reuse_components/SegmentFusionButton";
import {IntraDocSegmentSearchBarForRelationPost} from "./reuse_components/IntraDocSegmentSearchBarForRelationPost";
import {ClusterMembersAndReID} from "./reidentification/ClusterMembersAndReID";




const MediaDetails = ({ triggerSnackbar }) => {
    const objectId = useParams()["*"];
    const navigate = useNavigate();
    const location = useLocation()

    const [loading, setLoading] = React.useState(true);
    const [filename, setFilename] = React.useState()
    const [rawfiletype, setRawFiletype] = React.useState()
    const [filetype, setFiletype] = React.useState()
    const [dimensions, setDimensions] = React.useState()
    const [segmenttype, setSegmentType] = React.useState([])
    const [segmentDefinition, setSegmentDefinition] = React.useState([])
    const [segmentOf, setSegmentOf] = React.useState([])

    const [objectLabels, setObjectLabels] = React.useState([])
    const [newObjectLabel, setNewObjectLabel] = React.useState("")
    const [groundingPhrases, setGroundingPhrases] = React.useState([])
    const [segments, setSegments] = React.useState([])
    const [refreshTrigger, setRefreshTrigger] = React.useState(true)

    // caption
    const [caption, setCaption] = React.useState("")
    const [captionLoading, setCaptionLoading] = React.useState(false)
    const [anchorEl, setAnchorEl] = React.useState(null); // for menu
    const [isEditingCaption, setIsEditingCaption] = React.useState(false);
    const [generateSegmentsLoading, setGenerateSegmentsLoading] = React.useState(false);

    // wikidata ids
    const [wikidataId, setWikidataId] = React.useState('')
    const [wikiLabel, setWikiLabel] = React.useState('')
    const [wikiDescription, setWikiDescription] = React.useState('')
    const [wikiSearchInputValue, setWikiSearchInputValue] = useState('')

    // intra-document relations
    const [intraDocRels, setIntraDocRels] = useState([])
    const [entityPropertyPairs, setEntityPropertyPairs] = useState([])
    const [audioTrackUrl, setAudioTrackUrl] = useState("")
    const [originVideoUrl, setOriginVideoUrl] = useState("")

    // embeddings
    const [isTextSeg, setIsTextSeg] = useState(false)
    const [vertexaiEmbedding, setVertexaiEmbedding] = useState([])
    const [clapEmbedding, setClapEmbedding] = useState([])

    // reidentification
    const [clusterId, setClusterId] = useState(undefined)

    React.useEffect(() => {
        async function fetchMedia() {
            let options = {
                method: 'POST',
                body: JSON.stringify({
                    "s": ["<" + BACKEND_URL + "/" + objectId + ">"],
                    "p": [],
                    "o": []
                })
            }
            let response = await fetch(BACKEND_URL + "/query/quads", options)
                .catch(() => triggerSnackbar(BACKEND_ERR, "error"))
            if (response === undefined) return
            let data = await response.json()

            let segType = []
            let segDef = []
            let objLab=[]
            let grdPhr = []

            data.results.forEach((res) => {
                if (res.p === "<http://megras.org/schema#canonicalMimeType>") {
                    setFiletype(res.o.replace("^^String", ""))
                } else if (res.p === "<http://megras.org/schema#rawMimeType>") {
                    setRawFiletype(res.o.replace("^^String", ""))
                } else if (res.p === "<http://megras.org/schema#fileName>") {
                    setFilename(res.o.replace("^^String", ""))
                } else if (res.p === "<https://schema.org/caption>") {
                    setCaption(res.o.replace("^^String", "")) // Note: Only one caption will be showed
                } else if (res.p === "<https://schema.org/label>") {
                    objLab.push(res.o.replace("^^String", ""))
                } else if (res.p ===  "<http://megras.org/schema#groundingPhrase>") {
                    grdPhr.push(res.o.replace("^^String", ""))
                } else if (res.p === "<http://megras.org/schema#bounds>") {
                    let dim = res.o.replace("^^String", "").split(",")
                    dim = dim.filter((d, i) => d !== "-" && i % 2 === 1)
                    setDimensions(dim.join(" x "))
                } else if (res.p === "<http://megras.org/schema#segmentType>") {
                    segType.push(res.o.replace("^^String", ""))
                } else if (res.p === "<http://megras.org/schema#segmentDefinition>") {
                    segDef.push(res.o.replace("^^String", ""))
                } else if (res.p === "<http://www.wikidata.org/prop/direct/P180>") {
                    setWikidataId(res.o.replace("^^String", ""))
                } else if (res.p === "<http://megras.org/schema#wikiLabel>") {
                    setWikiLabel(res.o.replace("^^String", ""))
                } else if (res.p === "<http://megras.org/schema#wikiDescription>") {
                    setWikiDescription(res.o.replace("^^String", ""))
                } else if (res.p === "<http://megras.org/schema#vertexaiEmbedding>") {
                    setVertexaiEmbedding(JSON.parse(res.o.replace("^^FloatVector", "")))
                } else if (res.p === "<http://megras.org/schema#clapEmbedding>") {
                    setClapEmbedding(JSON.parse(res.o.replace("^^FloatVector", "")))
                } else if (res.p === "<http://megras.org/schema#reidentificationClusterId>") {
                    setClusterId(res.o.replace("^^String", ""))
                }
            })
            setObjectLabels(objLab)
            setGroundingPhrases(grdPhr)
            setSegmentDefinition(segDef)
            setSegmentType(segType)

            let isSegment = objectId.includes("/c/")
            if (isSegment) {
                let options = {
                    method: 'POST',
                    body: JSON.stringify({
                        "seeds": ["<" + BACKEND_URL + "/" + objectId + ">"],
                        "predicates": ["<http://megras.org/schema#segmentOf>"],
                        "maxDepth": 5
                    })
                }
                let response = await fetch(BACKEND_URL + "/query/path", options)
                    .catch(() => triggerSnackbar(BACKEND_ERR, "error"))
                if (response === undefined) return
                let data = await response.json()
                let segOf = data.results.map((r) => r.o.replace("<", "").replace(">", ""))
                setSegmentOf([...new Set(segOf)])

                // find filetype and filename of segment
                options = {
                    method: 'POST',
                    body: JSON.stringify({
                        "s": ["<" + BACKEND_URL + "/" + objectId.slice(0, objectId.indexOf("/")) + ">"],
                        "p": ["<http://megras.org/schema#canonicalMimeType>", "<http://megras.org/schema#fileName>"],
                        "o": []
                    })
                }

                response = await fetch(BACKEND_URL + "/query/quads", options)
                    .catch(() => triggerSnackbar(BACKEND_ERR, "error"))
                if (response === undefined) return
                data = await response.json()
                data.results.forEach((res) => {
                    if (res.p === "<http://megras.org/schema#canonicalMimeType>") {
                        setFiletype(res.o.replace("^^String", ""))
                        setIsTextSeg(res.o.startsWith('text'))
                    } else if (res.p === "<http://megras.org/schema#fileName>") {
                        setFilename(res.o.replace("^^String", ""))
                    }
                })

            }

        }

        async function fetchSegments() {
            let options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "s": [],
                    "p": ["<http://megras.org/schema#segmentOf>"],
                    "o": ["<" + BACKEND_URL + "/" + objectId + ">"]
                })
            };

            let response = await fetch(BACKEND_URL + "/query/quads", options)
                .catch(() => triggerSnackbar(BACKEND_ERR, "error"));

            if (!response || !response.ok) return;
            let data = await response.json();

            const segmentUrls = data.results.map(d => d.s);

            options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "s": segmentUrls,
                    "p": ["<https://schema.org/label>"],
                    "o": []
                })
            };

            response = await fetch(BACKEND_URL + "/query/quads", options)
                .catch(() => triggerSnackbar(BACKEND_ERR, "error"));

            if (!response || !response.ok) return;

            let dataHasLabels = await response.json();

            const segments = segmentUrls.map(url => {
                const labels = dataHasLabels.results
                    .filter(labelData => labelData.s === url)
                    .map(labelData => labelData.o.replace("^^String", ""));

                return {
                    url: url,
                    labels: labels.length > 0 ? labels : []
                };
            });

            setSegments(segments);
        }

        async function fetchAudioTrack() {
            let options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "s": [],
                    "p": ["<http://megras.org/schema#audioTrackOf>"],
                    "o": ["<" + BACKEND_URL + "/" + objectId + ">"]
                })
            };
            let response = await fetch(BACKEND_URL + "/query/quads", options)
                .catch(() => triggerSnackbar(BACKEND_ERR, "error"));

            if (!response || !response.ok) return;

            let data = await response.json();
            if (data.results.length < 1) return;
            setAudioTrackUrl(data.results[0].s.replace("<", "").replace(">", ""))
        }

        async function fetchOriginVideo() {
            let options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "s": ["<" + BACKEND_URL + "/" + objectId + ">"],
                    "p": ["<http://megras.org/schema#audioTrackOf>"],
                    "o": []
                })
            };
            let response = await fetch(BACKEND_URL + "/query/quads", options)
                .catch(() => triggerSnackbar(BACKEND_ERR, "error"));

            if (!response || !response.ok) return;

            let data = await response.json();
            if (data.results.length < 1) return;
            setOriginVideoUrl(data.results[0].o.replace("<", "").replace(">", ""))
        }


        fetchMedia().then();
        fetchSegments().then();
        if (filetype && filetype.startsWith('video')) {
            fetchAudioTrack().then();
        }
        if (filetype && filetype.startsWith('audio')) {
            fetchOriginVideo().then();
        }

        return () => { }
    }, [location.key, refreshTrigger, filetype])

    React.useEffect(() => {
        async function fetchIntraDocRels() {
            if (segments.length === 0) return;
            const segmentUrls = segments.map(d => d.url);
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "s": segmentUrls,
                    "p": [],
                    "o": segmentUrls
                })
            };

            let response = await fetch(BACKEND_URL + "/query/quads", options)
                .catch(() => triggerSnackbar(BACKEND_ERR + ": fetchIntraDocRels", "error"));

            if (!response || !response.ok) return;

            let relationQuads = await response.json();

            const triplets = relationQuads.results.map((quad) => {
                // url with labels
                const target_segment_s = segments.find((segment) => segment.url === quad.s)
                const target_segment_o = segments.find((segment) => segment.url === quad.o)
                return {
                    "s": target_segment_s,
                    "p": quad.p,
                    "o": target_segment_o
                }
            })
            setIntraDocRels(triplets)

        }
        async function fetchEntityPropertyPairs() {
            if (segments.length === 0) return;
            const segmentUrls = segments.map(d => d.url);

            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "s": segmentUrls,
                    "p": ["<http://megras.org/schema#hasProperty>"],
                    "o": []
                })
            };

            let response = await fetch(BACKEND_URL + "/query/quads", options)
                .catch(() => triggerSnackbar(BACKEND_ERR + ": fetchEntityPropertyPairs", "error"));

            if (!response || !response.ok) return;

            let epPairQuads = await response.json();

            const triplets = epPairQuads.results.map((quad) => {
                const target_segment_s = segments.find((segment) => segment.url === quad.s)
                return {
                    "s": target_segment_s,
                    "p": quad.p,
                    "o": quad.o.replace("^^String", "")
                }
            })
            setEntityPropertyPairs(triplets)
        }

        fetchIntraDocRels().then();
        fetchEntityPropertyPairs().then();

    }, [segments, refreshTrigger]);


    const handleCaptionMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCaptionMenuClose = (task) => {
        setAnchorEl(null);
        if (task) {
            generateImageCaption(task).then();
        }
    };
    const generateImageCaption = async (captionTask) => {
        setCaptionLoading(true);
        const requestBody = [BACKEND_URL + "/" + objectId];

        const requestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        };

        const url = new URL(`${MEGRA_CON_URL}/image/caption/auto`);
        url.searchParams.append('caption_task', captionTask);

        let response = await fetch(url.toString(), requestOptions)
            .catch(() => triggerSnackbar(MEGRA_CON_ERR, "error"));

        if (!response) return;

        setCaptionLoading(false);
        setRefreshTrigger(!refreshTrigger)
    };

    const generateAudioCaption = async () => {
        setCaptionLoading(true);
        const requestBody = [BACKEND_URL + "/" + objectId];

        const requestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        };

        const url = new URL(`${MEGRA_CON_URL}/audio/caption/auto`);

        let response = await fetch(url.toString(), requestOptions)
            .catch(() => triggerSnackbar(MEGRA_CON_ERR, "error"));

        if (!response) return;

        setCaptionLoading(false);
        setRefreshTrigger(!refreshTrigger)
    };

    const generateVideoCaption = async () => {
        setCaptionLoading(true);
        const requestBody = [BACKEND_URL + "/" + objectId];

        const requestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        };

        const url = new URL(`${MEGRA_CON_URL}/video/shot/caption/auto`);

        let response = await fetch(url.toString(), requestOptions)
            .catch(() => triggerSnackbar(MEGRA_CON_ERR, "error"));

        if (!response) return;

        setCaptionLoading(false);
        setRefreshTrigger(!refreshTrigger)
    };



    const handleCaptionToggleEdit = () => {
        setIsEditingCaption((prev) => !prev);
    };

    const sendCaption = async () => {
        const requestBody = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "file_urls": [BACKEND_URL + "/" + objectId],
                "captions": [caption],
            }),
        };

        let response = await fetch(MEGRA_CON_URL + "/put/caption", requestBody)
            .catch(() => triggerSnackbar(MEGRA_CON_ERR, "error"));

        if (response === undefined) return;
        if (response.ok) {
            setIsEditingCaption(false);
            triggerSnackbar("Caption updated successfully", "success");
        }
    };

    const sendNewObjectLabel = async () => {
        const requestBody = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "object_urls": [BACKEND_URL + "/" + objectId],
                "labels": [newObjectLabel.trim()],
            }),
        };

        let response = await fetch(MEGRA_CON_URL + "/add/label", requestBody)
            .catch(() => triggerSnackbar(MEGRA_CON_ERR, "error"));

        if (response.ok) {
            setObjectLabels([...objectLabels, newObjectLabel]);
            setNewObjectLabel("");
        }
    }

    const deleteObjectLabel = async (labelToDelete) => {
        const url = new URL(`${MEGRA_CON_URL}/delete/label`);
        url.searchParams.append('object_url', BACKEND_URL + "/" + objectId);

        let requestBody;
        if (labelToDelete) { // else delete all labels of this object
            requestBody = JSON.stringify([labelToDelete])
        }

        const requestOptions = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: requestBody,
        };

        let response = await fetch(url, requestOptions)
            .catch(() => triggerSnackbar(MEGRA_CON_ERR, "error"));

        if (response.ok) {
            if (labelToDelete === undefined) {
                setObjectLabels([]);
            } else {
                setObjectLabels(objectLabels.filter((label) => label !== labelToDelete));
            }
        }
    };

    const putWikidataId = async (selectedWikiId) => {
        const requestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "object_urls": [BACKEND_URL + "/" + objectId],
                "wiki_ids": [selectedWikiId.trim()],
            }),
        };

        const url = new URL(`${MEGRA_CON_URL}/put/wiki/items`);
        url.searchParams.append('is_text', isTextSeg.toString());

        let response = await fetch(url.toString(), requestOptions)
            .catch(() => triggerSnackbar(MEGRA_CON_ERR, "error"));

        if (response.ok) {
            setWikidataId(selectedWikiId);
        }
        setRefreshTrigger(!refreshTrigger)
    }

    const deleteWikidataId = async () => {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify([BACKEND_URL + "/" + objectId]),
        };

        const url = new URL(`${MEGRA_CON_URL}/delete/wiki/items`);
        url.searchParams.append('is_text', isTextSeg.toString());

        let response = await fetch(url.toString(), requestOptions)
            .catch(() => triggerSnackbar(MEGRA_CON_ERR, "error"));

        if (response.ok) {
            setWikidataId('');
        }
        setRefreshTrigger(!refreshTrigger)
    }


    const deleteMedium = async () => {
        let response = await fetch(BACKEND_URL + "/" + objectId, { method: 'DELETE' })
            .catch(() => triggerSnackbar(BACKEND_ERR, "error"))
        if (response === undefined) return
        if (response.ok) {
            if (segmentOf.length > 0) {
                let uri = segmentOf[0].replace(BACKEND_URL, "")
                return navigate(uri)
            } else {
                return navigate("/")
            }
        }
    }

    const selectOf = (s) => {
        let uri = s.replace(BACKEND_URL, "")
        return navigate(uri)
    }

    const selectSegment = (url) => {
        let uri = url.replace("<" + BACKEND_URL, "").replace(">", "")
        return navigate(uri)
    }

    const deleteSegments = async (segmentUrlsToDelete) => {
        for (const segmentUrl of segmentUrlsToDelete) {
            await fetch(segmentUrl.replace('<', '').replace('>', ''), { method: 'DELETE' })
                .catch(() => triggerSnackbar(BACKEND_ERR, "error"))
        }

        setRefreshTrigger(!refreshTrigger)
    }


    const details = (
        <>
            <Stack spacing={3} alignItems="center" direction="column" mb={6}>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant='contained'
                        color='warning'
                        startIcon={<DeleteIcon />}
                        onClick={deleteMedium}
                    >
                        Delete
                    </Button>
                    {["text/plain", "image/jpeg","image/png", "video/webm", "audio/webm"].includes(filetype) &&
                        <Button
                            variant='contained'
                            color='secondary'
                            startIcon={<AddIcon />}
                            onClick={() => navigate("/segment/" + objectId)}
                        >
                            Add segment
                        </Button>
                    }
                </Stack>
                <TableContainer component={Paper} sx={{ width: '60vw' }}>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell sx={{ verticalAlign: 'center' }}>Source</TableCell>
                                <TableCell>
                                    <Button onClick={() => window.open(BACKEND_URL + "/" + objectId, "_blank")} startIcon={<OpenInNewIcon />} >Open</Button>
                                </TableCell>
                            </TableRow>
                            {filename && <TableRow>
                                <TableCell>File name</TableCell>
                                <TableCell>{filename}</TableCell>
                            </TableRow>}
                            {filetype && <TableRow>
                                <TableCell>File type</TableCell>
                                <TableCell>{filetype}</TableCell>
                            </TableRow>}
                            {rawfiletype && <TableRow>
                                <TableCell>Raw file type</TableCell>
                                <TableCell>{rawfiletype}</TableCell>
                            </TableRow>}
                            {dimensions && <TableRow>
                                <TableCell>Dimensions</TableCell>
                                <TableCell>{dimensions}</TableCell>
                            </TableRow>}
                            {audioTrackUrl && <TableRow>
                                <TableCell>Has audio track</TableCell>
                                <TableCell>
                                    <Box sx={{ width: '30%', cursor: 'pointer'}}
                                        onClick={() => selectOf(audioTrackUrl)}>
                                        <FileDisplay isPreview filedata={audioTrackUrl} filetype={'audio'} />
                                    </Box>
                                </TableCell>
                            </TableRow>}
                            {originVideoUrl && <TableRow>
                                <TableCell>Audio track of</TableCell>
                                <TableCell>
                                    <Box sx={{ width: '30%', cursor: 'pointer'}}
                                         onClick={() => selectOf(originVideoUrl)}>
                                        <FileDisplay isPreview filedata={originVideoUrl} filetype={'video'} />
                                    </Box>
                                </TableCell>
                            </TableRow>}
                            {filetype &&
                                (
                                    (filetype.startsWith('image') && segmenttype.length === 0) ||
                                    (filetype.startsWith('audio') && segmenttype.length === 0) ||
                                    (filetype.startsWith('video') && segmenttype.length === 1 && segmenttype[0] === "time")
                                ) &&
                                <TableRow>
                                    <TableCell>Caption</TableCell>
                                    <TableCell>
                                        <Stack  spacing={2} direction="row" justifyContent="left" alignItems="left">
                                            <ThemeProvider theme={createTheme({
                                                palette: {
                                                    text: {
                                                        disabled: "#0d0d0d",
                                                    },
                                                },
                                            })}>
                                                <TextField
                                                    sx={{ width: '18vw', margin: '0' }}
                                                    multiline
                                                    minRows={4}
                                                    value={caption}
                                                    onChange={(e) => setCaption(e.target.value)}
                                                    disabled={!isEditingCaption}
                                                />
                                            </ThemeProvider>
                                            {filetype && filetype.startsWith("image") &&
                                                <>
                                                {captionLoading ? <CircularProgress /> :
                                                    <IconButton onMouseEnter={handleCaptionMenuOpen}> <AutoAwesomeIcon /></IconButton>
                                                }
                                                    <Menu
                                                        anchorEl={anchorEl}
                                                        open={Boolean(anchorEl)}
                                                        onClose={() => handleCaptionMenuClose(null)}
                                                        anchorOrigin={{
                                                            vertical: 'bottom',
                                                            horizontal: 'left',
                                                        }}
                                                        transformOrigin={{
                                                            vertical: 'top',
                                                            horizontal: 'left',
                                                        }}
                                                    >
                                                        <MenuItem onClick={() => handleCaptionMenuClose("CAPTION")}>Caption</MenuItem>
                                                        <MenuItem onClick={() => handleCaptionMenuClose("DETAILED_CAPTION")}>Detailed Caption</MenuItem>
                                                        <MenuItem onClick={() => handleCaptionMenuClose("MORE_DETAILED_CAPTION")}>More Detailed Caption</MenuItem>
                                                    </Menu>
                                                </>
                                            }
                                            {filetype && filetype.startsWith("audio") &&
                                                <>
                                                    {captionLoading ? <CircularProgress /> :
                                                        <IconButton onClick={generateAudioCaption}> <AutoAwesomeIcon /></IconButton>
                                                    }
                                                </>
                                            }
                                            {filetype && filetype.startsWith("video") &&
                                                <>
                                                    {captionLoading ? <CircularProgress /> :
                                                        <IconButton onClick={generateVideoCaption}> <AutoAwesomeIcon /></IconButton>
                                                    }
                                                </>
                                            }

                                            <IconButton  variant="contained" color="secondary" >
                                                {isEditingCaption ? <SendIcon onClick={sendCaption}/> : <EditIcon onClick={handleCaptionToggleEdit}/>}
                                            </IconButton>

                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            }
                            {segmenttype.length > 0 && <TableRow>
                                <TableCell>Segment Type</TableCell>
                                <TableCell>{segmenttype.join(" + ")}</TableCell>
                            </TableRow>}
                            {segmenttype.length > 0 && (
                                <TableRow>
                                    <TableCell>Object Label</TableCell>
                                    <TableCell>
                                        <Stack spacing={2} direction="row" justifyContent="left" alignItems="center"
                                               sx={{ width: '30vw', display: 'flex', flexWrap: 'wrap',}}>
                                            {objectLabels.map((label, index) => (
                                                <Chip
                                                    key={index}
                                                    label={label}
                                                    onDelete={() => deleteObjectLabel(label)}
                                                    sx={{ margin: '2px'}}
                                                />
                                            ))}

                                        </Stack>
                                        <div style={{marginTop: '10px'}}>
                                            <TextField
                                                sx={{ width: '18vw' }}
                                                value={newObjectLabel}
                                                placeholder="Add label"
                                                onChange={(e) => setNewObjectLabel(e.target.value)}
                                            />
                                            <IconButton variant='contained' color='secondary' onClick={sendNewObjectLabel}>
                                                <SendIcon />
                                            </IconButton>
                                            <Tooltip title="Delete all" arrow>
                                                <IconButton
                                                    variant='outlined'
                                                    onClick={() => deleteObjectLabel(undefined)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </div>

                                    </TableCell>
                                </TableRow>
                            )}
                            {segmentOf.length > 0 && (
                                (filetype && filetype.startsWith('video') && segmenttype.length === 1 && segmenttype[0] === 'time') ?
                                    null :
                                    (
                                    <TableRow>
                                        <TableCell>Wikidata</TableCell>
                                        <TableCell>
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead>
                                                {wikidataId !== '' &&
                                                    <tr>
                                                        <th style={{ padding: '8px', border: '1px solid #ddd' }}>Wiki ID</th>
                                                        <th style={{ padding: '8px', border: '1px solid #ddd' }}>Wiki Label</th>
                                                        <th style={{ padding: '8px', border: '1px solid #ddd' }}>Wiki Description</th>
                                                        <th style={{ padding: '3px', border: '1px solid #ddd' }}></th>
                                                    </tr>
                                                }

                                                </thead>
                                                <tbody>
                                                {wikidataId !== '' &&
                                                    <tr>
                                                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                                                            <WikiLinkWithPreview
                                                                wikiId={wikidataId}
                                                            />
                                                        </td>
                                                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{wikiLabel}</td>
                                                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{wikiDescription}</td>
                                                        <td style={{ padding: '3px', border: '1px solid #ddd' }}>
                                                            <IconButton
                                                                variant='outlined'
                                                                onClick={() => deleteWikidataId().then()}
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </td>
                                                    </tr>
                                                }
                                                <tr>
                                                    <td colSpan="4" style={{ padding: '8px', border: '1px solid #ddd' }}>
                                                        <FuzzySearch
                                                            initialInputValue={wikiSearchInputValue}
                                                            onSelect={(selectedWikiId) => {
                                                                putWikidataId(selectedWikiId).then();
                                                            }}
                                                        />
                                                    </td>
                                                </tr>
                                                </tbody>
                                            </table>
                                        </TableCell>
                                    </TableRow>
                                    )
                            )}

                            {segmentOf.length > 0 && <TableRow>
                                <TableCell style={{ verticalAlign: 'top' }}>Segment of</TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                                        {segmentOf.map((s) => (
                                            <Box
                                                key={s.url}
                                                sx={{
                                                    cursor: 'pointer',
                                                    border: '1px solid #ccc',
                                                    padding: 1,
                                                    borderRadius: 1,
                                                    width: '45%',
                                                    marginBottom: 2,
                                                    marginRight: "5%",
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                }}
                                            >
                                                <Box onClick={() => selectOf(s)}>
                                                    <FileDisplay isPreview filedata={s} filetype={filetype} />
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </TableCell>
                            </TableRow>}

                            <SegmentGenerateButton
                                objectId={objectId}
                                filetype={filetype}
                                segmenttype={segmenttype}
                                generateSegmentsLoading={generateSegmentsLoading}
                                setGenerateSegmentsLoading={setGenerateSegmentsLoading}
                                refreshTrigger={refreshTrigger}
                                setRefreshTrigger={setRefreshTrigger}
                                triggerSnackbar={triggerSnackbar}
                            />

                            {segments.length > 0 && <TableRow>
                                <TableCell style={{ verticalAlign: 'top' }}>
                                    Segments
                                    <br/>
                                    <br/>
                                    <Button
                                        variant='contained'
                                        color='warning'
                                        startIcon={<DeleteIcon />}
                                        onClick={() => deleteSegments(segments.map(s => s.url))}
                                    >
                                        Delete Segments
                                    </Button>

                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                                        {segments.map((s) => (
                                            <Box
                                                key={s.url}
                                                sx={{
                                                    cursor: 'pointer',
                                                    border: '1px solid #ccc',
                                                    padding: 1,
                                                    borderRadius: 1,
                                                    width: '23%',
                                                    marginBottom: 2,
                                                    marginRight: "2%",
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    position: "relative",
                                                }}
                                            >
                                                <Box sx={{minHeight: "100px", maxHeight: "200px"}}
                                                    onClick={() => selectSegment(s.url)}>
                                                    <FileDisplay isPreview filedata={s.url.replace("<", "").replace(">", "")} filetype={filetype} />
                                                </Box>

                                                <Stack direction="row" spacing={1} sx={{ marginTop: 'auto', flexWrap: 'wrap', marginBottom: 1 }}>
                                                    {s.labels.map((label, index) => (
                                                        <Chip key={index} label={label} variant="outlined" />
                                                    ))}
                                                </Stack>
                                                <DeleteIcon
                                                    sx={{
                                                        position: "absolute",
                                                        fontSize: "1rem",
                                                        bottom: "5px",
                                                        right: "5px",
                                                        zIndex: 999,
                                                        cursor: "pointer",
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteSegments([s.url]).then();
                                                    }}
                                                />
                                            </Box>
                                        ))}
                                    </Box>
                                </TableCell>
                            </TableRow>}

                            <SegmentFusionButton
                                objectId={objectId}
                                filetype={filetype}
                                segments={segments}
                                refreshTrigger={refreshTrigger}
                                setRefreshTrigger={setRefreshTrigger}
                                triggerSnackbar={triggerSnackbar}
                            />

                            {segments.length > 0 && <TableRow>
                                <TableCell style={{ verticalAlign: 'top' }}>Intra-Doc Relations</TableCell>
                                <TableCell>
                                    <TripletDisplay triplets={intraDocRels}
                                                    triggerSnackbar={triggerSnackbar}
                                                    refreshTrigger={refreshTrigger}
                                                    setRefreshTrigger={setRefreshTrigger}
                                    />
                                    <IntraDocSegmentSearchBarForRelationPost
                                        segments={segments}
                                        filetype={filetype}
                                        isEntityPropertyPair={false}
                                        refreshTrigger={refreshTrigger}
                                        setRefreshTrigger={setRefreshTrigger}
                                        triggerSnackbar={triggerSnackbar}
                                    />
                                </TableCell>
                            </TableRow>}

                            {segments.length > 0 && <TableRow>
                                <TableCell style={{ verticalAlign: 'top' }}>Intra-Doc Entity-Property Pairs</TableCell>
                                <TableCell>
                                    <TripletDisplay triplets={entityPropertyPairs}
                                                    triggerSnackbar={triggerSnackbar}
                                                    refreshTrigger={refreshTrigger}
                                                    setRefreshTrigger={setRefreshTrigger}
                                    />
                                    <IntraDocSegmentSearchBarForRelationPost
                                        segments={segments}
                                        filetype={filetype}
                                        isEntityPropertyPair={true}
                                        refreshTrigger={refreshTrigger}
                                        setRefreshTrigger={setRefreshTrigger}
                                        triggerSnackbar={triggerSnackbar}
                                    />
                                </TableCell>
                            </TableRow>}
                            {objectId.includes("/c/") && segmenttype.length === 1 && segmenttype[0] !== "time" &&
                                <ClusterMembersAndReID objectId={objectId}
                                                       clusterId={clusterId}
                                                       setClusterId={setClusterId}
                                                       triggerSnackbar={triggerSnackbar}
                                                       refreshTrigger={refreshTrigger}
                                                       setRefreshTrigger={setRefreshTrigger}
                                                       vertexaiEmbedding={vertexaiEmbedding}
                                                       clapEmbedding={clapEmbedding}
                                />
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            </Stack>
        </>
    )

    return (
        <>
            <div className='App-title'>
                Media Details
            </div>
            <div className="App-content">
                <>
                    {loading && <CircularProgress />}
                    {filename && filetype &&
                        <>
                            {filetype.startsWith("text/plain") ? (
                                <TextSegmentDetails
                                    segments={segments}
                                    triggerSnackbar={triggerSnackbar}
                                    objectId={objectId}
                                    setLoading={setLoading}
                                    details={details}
                                />
                                ) :
                                filetype.startsWith("image") ?
                                <ImageSegmentDetails
                                    triggerSnackbar={triggerSnackbar}
                                    objectId={objectId}
                                    setLoading={setLoading}
                                    details={details}
                                />
                                :
                                <MediaSegmentDetails
                                    triggerSnackbar={triggerSnackbar}
                                    objectId={objectId}
                                    loading={loading}
                                    setLoading={setLoading}
                                    filetype={filetype}
                                    filename={filename}
                                    details={details}
                                />
                            }
                        </>
                    }
                </>
            </div>
        </>
    )
}

export default MediaDetails;
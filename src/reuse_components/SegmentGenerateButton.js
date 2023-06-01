import {Box, CircularProgress, IconButton, MenuItem, Select, Stack, TableCell, TableRow} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import React, {useState} from "react";
import {GroundingButton} from "./GroundingButton";
import {BACKEND_URL, MEGRA_CON_URL} from "../Api";

export const SegmentGenerateButton = ({
                                          objectId,
                                          filetype,
                                          segmenttype,
                                          generateSegmentsLoading,
                                          setGenerateSegmentsLoading,
                                          refreshTrigger,
                                          setRefreshTrigger,
                                          triggerSnackbar,
                                      }) => {
    const generateSegmentsEL = async () => {

        setGenerateSegmentsLoading(true);
        const requestBody = [BACKEND_URL + "/" + objectId];
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        };

        const url = new URL(`${MEGRA_CON_URL}/text/el/auto`);
        let response = await fetch(url.toString(), requestOptions)
            .catch(() => triggerSnackbar("Error when auto generating segments.", "error"));

        if (!response) return;

        setGenerateSegmentsLoading(false);
        setRefreshTrigger(!refreshTrigger)

    };


    const imageGroundingWithOieFromCaption = async ({approximationType}) => {
        setGenerateSegmentsLoading(true);
        const requestBody = [BACKEND_URL + "/" + objectId];
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        };

        const url = new URL(`${MEGRA_CON_URL}/image/grounding/with/oie/auto`);
        url.searchParams.append('approximation_type', approximationType);
        let response = await fetch(url.toString(), requestOptions)
            .catch(() => triggerSnackbar("Error when auto image grounding with open info extraction from caption.", "error"));

        if (!response) return;

        setGenerateSegmentsLoading(false);
        setRefreshTrigger(!refreshTrigger)
    };

    const generateSceneGraph = async ({sceneGraphObjThreshold, sceneGraphRelThreshold, approximationType}) => {
        setGenerateSegmentsLoading(true);
        const requestBody = [BACKEND_URL + "/" + objectId];
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        };

        const url = new URL(`${MEGRA_CON_URL}/image/scene/graph/auto`);
        url.searchParams.append('obj_threshold', sceneGraphObjThreshold);
        url.searchParams.append('rel_threshold', sceneGraphRelThreshold);
        url.searchParams.append('approximation_type', approximationType);
        let response = await fetch(url.toString(), requestOptions)
            .catch(() => triggerSnackbar("Error when auto generating Scene Graph.", "error"));

        if (!response) return;

        setGenerateSegmentsLoading(false);
        setRefreshTrigger(!refreshTrigger)
    };

    function ImageSegButton() {
        const [selectedOptionForImageSeg, setSelectedOptionForImageSeg] = useState("imageGrounding");
        const [sceneGraphObjThreshold, setSceneGraphObjThreshold] = React.useState(0.3)
        const [sceneGraphRelThreshold, setSceneGraphRelThreshold] = React.useState(0.9);
        const [approximationType, setApproximationType] =  React.useState("polygon");

        return (
                <TableRow>
                    <TableCell>
                        <Select
                            value={selectedOptionForImageSeg}
                            onChange={(event) => setSelectedOptionForImageSeg(event.target.value)}
                            sx={{ whiteSpace: 'normal' }}
                        >
                            <MenuItem
                                value="imageGrounding"
                                sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
                            >
                                MoLiVER for image
                            </MenuItem>
                            <MenuItem
                                value="sceneGraphGeneration"
                                sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
                            >
                                Scene Graph Generation
                            </MenuItem>
                        </Select>
                    </TableCell>

                    <TableCell>
                        {selectedOptionForImageSeg === "imageGrounding" && (
                            <GroundingButton
                                filetype={filetype}
                                generateSegmentsLoading={generateSegmentsLoading}
                                executionFunction={imageGroundingWithOieFromCaption}
                                approximationType={approximationType}
                                setApproximationType={setApproximationType}
                            />
                        )}

                        {selectedOptionForImageSeg === "sceneGraphGeneration" && (
                            <Stack
                                spacing={2}
                                direction="row"
                                justifyContent="center"
                                alignItems="center"
                                sx={{
                                    padding: 2,
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    boxShadow: 2,
                                    backgroundColor: '#f4f4f9',
                                }}
                            >
                                <Box
                                    component="span"
                                    sx={{
                                        width: '25vw',
                                        fontSize: '1rem',
                                        fontWeight: '500',
                                        paddingRight: 1,
                                    }}
                                >
                                    Object Detection Threshold:
                                    <input
                                        value={sceneGraphObjThreshold}
                                        onChange={(e) => setSceneGraphObjThreshold(e.target.value)}
                                        type="number"
                                        step="0.1"
                                        max="1"
                                        min="0"
                                        style={{
                                            marginLeft: '1em',
                                            fontSize: '1.2em',
                                            width: '80px',
                                            padding: '5px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                        }}
                                    />
                                    <br/>
                                    Relation Extraction Threshold:
                                    <input
                                        value={sceneGraphRelThreshold}
                                        onChange={(e) => setSceneGraphRelThreshold(e.target.value)}
                                        type="number"
                                        step="0.1"
                                        max="1"
                                        min="0"
                                        style={{
                                            marginLeft: '1em',
                                            fontSize: '1.2em',
                                            width: '80px',
                                            padding: '5px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                        }}
                                    />
                                    <br/>
                                    Approximation Type:
                                    <Select
                                        value={approximationType}
                                        onChange={(e) => setApproximationType(e.target.value)}
                                        sx={{ whiteSpace: 'normal', marginLeft: '10px'}}
                                    >
                                        <MenuItem value="polygon">Polygon</MenuItem>
                                        <MenuItem value="rect">Rect</MenuItem>
                                        <MenuItem value="path">SVG Path</MenuItem>
                                    </Select>
                                </Box>
                                {generateSegmentsLoading ? (
                                    <CircularProgress />
                                ) : (
                                    <IconButton
                                        variant="contained"
                                        color="primary"
                                        onClick={() => generateSceneGraph({sceneGraphObjThreshold, sceneGraphRelThreshold, approximationType})}
                                        sx={{ borderRadius: '50%' }}
                                    >
                                        <AutoAwesomeIcon />
                                    </IconButton>
                                )}
                            </Stack>
                        )}
                    </TableCell>
                </TableRow>
        );
    }


    function VideoShotSegButton() {

        const [minFramesPerShot, setMinFramesPerShot] = useState(6);
        const [maxFramesPerShot, setMaxFramesPerShot] = useState(750)

        return (
            <TableRow>
                <TableCell>
                    Video Shot Segmentation
                </TableCell>
                <TableCell>
                    <Stack
                        spacing={2}
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                        sx={{
                            padding: 2,
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            boxShadow: 2,
                            backgroundColor: '#f4f4f9',
                        }}
                    >
                        <Box
                            component="span"
                            sx={{
                                width: '25vw',
                                fontSize: '1rem',
                                fontWeight: '500',
                                paddingRight: 1,
                            }}
                        >
                            Min Frames Per Shot <span style={{ fontSize: '0.8rem', color: 'gray' }}>(Ignore shorter shots)</span>:
                            <input
                                value={minFramesPerShot}
                                onChange={(e) => setMinFramesPerShot(e.target.value)}
                                type="number"
                                step="1"
                                max="100"
                                min="1"
                                style={{
                                    marginLeft: '1em',
                                    fontSize: '1.2em',
                                    width: '80px',
                                    padding: '5px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                }}
                            />
                            <br/>
                            Max Frames Per Shot <span style={{ fontSize: '0.8rem', color: 'gray' }}>(Split longer shots)</span>:
                            <input
                                value={maxFramesPerShot}
                                onChange={(e) => setMaxFramesPerShot(e.target.value)}
                                type="number"
                                step="1"
                                max="500"
                                min="1000"
                                style={{
                                    marginLeft: '1em',
                                    fontSize: '1.2em',
                                    width: '80px',
                                    padding: '5px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                }}
                            />
                        </Box>
                        {generateSegmentsLoading ? (
                            <CircularProgress />
                        ) : (
                            <IconButton
                                variant="contained"
                                color="primary"
                                onClick={() => doVideoShotSeg({minFramesPerShot, maxFramesPerShot})}
                                sx={{ borderRadius: '50%' }}
                            >
                                <AutoAwesomeIcon />
                            </IconButton>
                        )}
                    </Stack>
                </TableCell>

            </TableRow>
        )
    }

    const doVideoShotSeg = async ({minFramesPerShot, maxFramesPerShot}) => {
        setGenerateSegmentsLoading(true);
        const requestBody = [BACKEND_URL + "/" + objectId];
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        };

        const url = new URL(`${MEGRA_CON_URL}/video/shot/seg/auto`);
        url.searchParams.append('min_frames_per_shot', minFramesPerShot);
        url.searchParams.append('max_frames_per_shot', maxFramesPerShot);

        let response = await fetch(url.toString(), requestOptions)
            .catch(() => triggerSnackbar("Error when video shot segmentation.", "error"));

        if (!response) return;

        setGenerateSegmentsLoading(false);
        setRefreshTrigger(!refreshTrigger)
    };

    const doSpatTempVideoGrounding = async ({approximationType}) => {
        setGenerateSegmentsLoading(true);
        const requestBody = [BACKEND_URL + "/" + objectId];
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        };

        const url = new URL(`${MEGRA_CON_URL}/spat-temp/video/grounding/with/oie/auto`);
        url.searchParams.append('approximation_type', approximationType);

        let response = await fetch(url.toString(), requestOptions)
            .catch(() => triggerSnackbar("Error when doing spat temp video segmentation.", "error"));

        if (!response) return;

        setGenerateSegmentsLoading(false);
        setRefreshTrigger(!refreshTrigger)
    }

    const doAudioGrounding = async ({scoreThreshold, mergeThreshold, ignoreMinRange}) => {
        setGenerateSegmentsLoading(true);
        const requestBody = [BACKEND_URL + "/" + objectId];
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        };

        const url = new URL(`${MEGRA_CON_URL}/audio/grounding/auto`);
        url.searchParams.append('score_threshold', scoreThreshold);
        url.searchParams.append('merge_threshold', mergeThreshold);
        url.searchParams.append('ignore_min_range', ignoreMinRange);


        let response = await fetch(url.toString(), requestOptions)
            .catch(() => triggerSnackbar("Error when doing audio grounding.", "error"));

        if (!response) return;

        setGenerateSegmentsLoading(false);
        setRefreshTrigger(!refreshTrigger)
    }

    function AudioSegButton() {
        return (
            <TableRow>
                <TableCell>
                    Audio Grounding
                </TableCell>
                <TableCell>
                    <GroundingButton
                        filetype={filetype}
                        generateSegmentsLoading={generateSegmentsLoading}
                        executionFunction={doAudioGrounding}
                    />
                </TableCell>
            </TableRow>
        );
    }

    function VideoSegButton() {
        const [approximationType, setApproximationType] = useState("polygon");

        return (
            <TableRow>
                <TableCell>
                    MoLiVER for video
                </TableCell>
                <TableCell>
                    <GroundingButton
                        filetype={filetype}
                        generateSegmentsLoading={generateSegmentsLoading}
                        executionFunction={doSpatTempVideoGrounding}
                        approximationType={approximationType}
                        setApproximationType={setApproximationType}
                    />
                </TableCell>
            </TableRow>
        );
    }

    const TextSegButton = (() => (
        <TableRow>
            <TableCell>
                Entity Linking
            </TableCell>
            <TableCell>
                <Stack
                    spacing={2}
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                        padding: 2,
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        boxShadow: 2,
                        backgroundColor: '#f4f4f9',
                    }}
                >
                    <Box
                        component="span"
                        sx={{
                            fontSize: '1rem',
                            fontWeight: '500',
                            paddingRight: 1,
                        }}
                    >
                        Entity Linking (with Relik Model)
                    </Box>
                    {generateSegmentsLoading ? (
                        <CircularProgress />
                    ) : (
                        <IconButton
                            variant="contained"
                            color="primary"
                            onClick={generateSegmentsEL}
                            sx={{ borderRadius: '50%' }}
                        >
                            <AutoAwesomeIcon />
                        </IconButton>
                    )}
                </Stack>
            </TableCell>

        </TableRow>
    ))


    let button = (<></>);

    if (filetype) {
        if (filetype.startsWith("image") && segmenttype.length === 0) {
            button = ImageSegButton()
        } else if (filetype.startsWith("text") && segmenttype.length === 0) {
            button = TextSegButton()
        } else if (filetype.startsWith("video") && segmenttype.length === 0) {
            button = VideoShotSegButton()
        } else if (filetype.startsWith("video") && segmenttype.length === 1 && segmenttype[0] === "time") {
            button = VideoSegButton()
        } else if (filetype.startsWith("audio") && segmenttype.length === 0) {
            button = AudioSegButton()
        }
    }

    return (
        button
    );
};

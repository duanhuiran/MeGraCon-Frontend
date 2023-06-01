import {Box, CircularProgress, IconButton, MenuItem, Select, Stack} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import React, {useState} from "react";

export const GroundingButton = ({
                                         filetype,
                                         generateSegmentsLoading,
                                         executionFunction,
                                          approximationType,
                                          setApproximationType
                                         }) => {
    const ImageGroundingButton = (() => (
        filetype && filetype.startsWith("image") && (
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
                    <span style={{ fontSize: '0.8rem', color: 'gray' }}>(please make sure caption is provided)</span>
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
                        onClick={() => executionFunction({approximationType})}
                        sx={{ borderRadius: '50%' }}
                    >
                        <AutoAwesomeIcon />
                    </IconButton>
                )}
            </Stack>
        )
    ))

    const VideoGroundingButton = (() => (
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
                Approximation Type:
                <Select
                    value={approximationType}
                    onChange={(e) => setApproximationType(e.target.value)}
                    sx={{ whiteSpace: 'normal', marginLeft: '10px'}}
                >
                    <MenuItem value="polygon">Polygon</MenuItem>
                    <MenuItem value="rect">Rect</MenuItem>
                </Select>
            </Box>
            {generateSegmentsLoading ? (
                <CircularProgress />
            ) : (
                <IconButton
                    variant="contained"
                    color="primary"
                    onClick={() => executionFunction({ approximationType })}
                    sx={{ borderRadius: '50%' }}
                >
                    <AutoAwesomeIcon />
                </IconButton>
            )}
        </Stack>
    ))

    function AudioGroundingButton() {
        const [scoreThreshold, setScoreThreshold] = useState(0.2)
        const [mergeThreshold, setMergeThreshold] = useState(2000) // milliseconds
        const [ignoreMinRange, setIgnoreMinRange] = useState(500) // milliseconds

        return (
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
        ><Box
            component="span"
            sx={{
                width: '25vw',
                fontSize: '1rem',
                fontWeight: '500',
                paddingRight: 1,
            }}
        >
            Confidence Threshold:
            <input
                value={scoreThreshold}
                onChange={(e) => setScoreThreshold(e.target.value)}
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
            Merge Threshold (milliseconds):
            <input
                value={mergeThreshold}
                onChange={(e) => setMergeThreshold(e.target.value)}
                type="number"
                step="100"
                max="5000"
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
            Ignore Min Range (milliseconds):
            <input
                value={ignoreMinRange}
                onChange={(e) => setIgnoreMinRange(e.target.value)}
                type="number"
                step="1"
                max="300"
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
        </Box>
            {generateSegmentsLoading ? (
                <CircularProgress />
            ) : (
                <IconButton
                    variant="contained"
                    color="primary"
                    onClick={() => executionFunction({scoreThreshold, mergeThreshold, ignoreMinRange})}
                    sx={{ borderRadius: '50%' }}
                >
                    <AutoAwesomeIcon />
                </IconButton>
            )}
        </Stack>
    )}

    let button;

    if (filetype) {
        if (filetype.startsWith("image")) {
            button = ImageGroundingButton()
        } else if (filetype.startsWith("video")) {
            button = VideoGroundingButton()
        } else if (filetype.startsWith("audio")) {
            button = AudioGroundingButton()
        }
    }

    return (
        button
    );
};
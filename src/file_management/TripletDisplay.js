import React, {useState} from 'react';
import FileDisplay from "./FileDisplay";
import {BACKEND_URL} from "../Api";
import {useNavigate} from "react-router";
import {BACKEND_ERR} from "../utils/Errors";
import {Box, Button, Chip, CircularProgress, IconButton, Stack, TextField, ThemeProvider} from "@mui/material";
import {Edit as EditIcon} from "@mui/icons-material";
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import {createTheme} from "@mui/material/styles";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";


const TripletDisplay = ({ triplets, triggerSnackbar, refreshTrigger, setRefreshTrigger}) => {
    const navigate = useNavigate();
    const [isEditingLoading, setIsEditingLoading] = useState(false)
    const [tripletEditingIndex, setTripletEditingIndex] = useState(null);
    const [currentPredicateText, setCurrentPredicateText] = useState('')
    const [currentPropertyText, setCurrentPropertyText] = useState('')

    const selectSegment = (url) => {
        let uri = url.replace("<" + BACKEND_URL, "").replace(">", "");
        return navigate(uri);
    };

    if (triplets.length === 0) return null;

    const enterEditMode = (index, triplet) => {
        setTripletEditingIndex(index);
        setCurrentPredicateText(triplet.p.replace("<http://megras.org/schema#", "").replace(">", ""));
        setCurrentPropertyText(typeof triplet.o === 'string' ? triplet.o : '');
    };

    const cancelEditMode = () => {
        setTripletEditingIndex(null);
        setCurrentPredicateText('');
        setCurrentPropertyText('');
    };

    const sendEditTriplet = async () => {
        setIsEditingLoading(true)

        if (tripletEditingIndex === null) { return }
        const oldTriplet = triplets[tripletEditingIndex]
        const isProperty = typeof oldTriplet.o === 'string'
        // delete old quad
        let response = await deleteTriplet( oldTriplet, false )
        if (response === undefined) return

        // add new quad
        const newTripletObject = isProperty ? currentPropertyText : oldTriplet.o.url
        let newPredicate = currentPredicateText
        if (!newPredicate.startsWith("<http://megras.org/schema#")) {
            newPredicate = "<http://megras.org/schema#" + newPredicate + ">"
        }

        let options = {
            method: 'POST',
            body: JSON.stringify({
                "quads" : [{
                    "s": oldTriplet.s.url,
                    "p": newPredicate,
                    "o": newTripletObject
                }]
            })
        }
        response = await fetch(BACKEND_URL + "/add/quads", options)
            .catch(() => triggerSnackbar(BACKEND_ERR + 'Error when adding triplet', "error"))
        if (response === undefined) return

        setIsEditingLoading(false)
        setTripletEditingIndex(null);
        setRefreshTrigger(!refreshTrigger)
    }
    const deleteTriplet = async (oldTriplet, refresh) => {
        if (refresh === true) { setIsEditingLoading(true) }
        const isProperty = typeof oldTriplet.o === 'string'
        const oldTripletObject = isProperty ? oldTriplet.o : oldTriplet.o.url
        let options = {
            method: 'POST',
            body: JSON.stringify({
                "s": [oldTriplet.s.url],
                "p": [oldTriplet.p],
                "o": [oldTripletObject]
            })
        }
        let response = await fetch(BACKEND_URL + "/delete/quads", options)
            .catch(() => triggerSnackbar(BACKEND_ERR + 'Error when deleting triplet', "error"))
        if (refresh === true) {
            setIsEditingLoading(false)
            setRefreshTrigger(!refreshTrigger)
        }

        return response
    }

    return (
        <div>
            {triplets.map((triplet, index) => {
                const isEditing = index === tripletEditingIndex;
                const predicate = typeof triplet.p === 'string'
                    ? triplet.p.replace("<http://megras.org/schema#", "").replace(">", "")
                    : '';

                return (
                    <Box
                        key={index}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: 2,
                        }}
                    >
                        <Box
                            key={triplet.s.url}
                            sx={{
                                cursor: 'pointer',
                                border: '1px solid #ccc',
                                padding: 1,
                                borderRadius: 1,
                                width: '23%',
                                marginRight: "1%",
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <Box
                                sx={{ height: "100px"}}
                                onClick={() => selectSegment(triplet.s.url)}
                            >
                                <FileDisplay
                                    isPreview
                                    filedata={triplet.s.url.replace("<", "").replace(">", "")}
                                    filetype="image"
                                />
                            </Box>
                            <Stack direction="row" spacing={1} sx={{ marginTop: 'auto', flexWrap: 'wrap', marginBottom: 1 }}>
                                {triplet.s.labels.map((label, index) => (
                                    <Chip key={index} label={label} variant="outlined" />
                                ))}
                            </Stack>
                        </Box>

                        <Box
                            sx={{
                                width: '23%',
                                marginLeft: "1%",
                                marginRight: "1%",
                                flexDirection: 'row',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <ThemeProvider theme={createTheme({
                                palette: {
                                    text: {
                                        disabled: "#333333",
                                    },
                                },
                            })}>
                                <TextField
                                    value={isEditing ? currentPredicateText : predicate}
                                    onChange={(e) => setCurrentPredicateText(e.target.value)}
                                    disabled={!isEditing || predicate === "hasProperty"}
                                />
                            </ThemeProvider>
                            <ArrowRightIcon/>
                        </Box>


                        {typeof triplet.o === 'string' ? (
                            <Box
                                key={index}
                                sx={{
                                    border: '1px solid #ccc',
                                    padding: 1,
                                    borderRadius: 1,
                                    width: '23%',
                                    marginLeft: "1%",
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                <ThemeProvider theme={createTheme({
                                    palette: {
                                        text: {
                                            disabled: "#333333",
                                        },
                                    },
                                })}>
                                    <TextField
                                        value={isEditing ? currentPropertyText : triplet.o}
                                        onChange={(e) => setCurrentPropertyText(e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </ThemeProvider>

                            </Box>
                        ) : (
                            <Box
                                key={triplet.o.url}
                                sx={{
                                    cursor: 'pointer',
                                    border: '1px solid #ccc',
                                    padding: 1,
                                    borderRadius: 1,
                                    width: '23%',
                                    marginLeft: "1%",
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                <Box
                                    sx={{ height: "100px" }}
                                    onClick={() => selectSegment(triplet.o.url)}
                                >
                                    <FileDisplay
                                        isPreview
                                        filedata={triplet.o.url.replace("<", "").replace(">", "")}
                                        filetype="image"
                                    />
                                </Box>
                                <Stack direction="row" spacing={1} sx={{ marginTop: 'auto', flexWrap: 'wrap', marginBottom: 1 }}>
                                    {triplet.o.labels.map((label, index) => (
                                        <Chip key={index} label={label} variant="outlined" />
                                    ))}
                                </Stack>
                            </Box>
                        )}

                        {isEditing ? (
                            isEditingLoading ? (
                                <CircularProgress />
                            ) : (
                                <>
                                    <IconButton onClick={sendEditTriplet} disabled={isEditingLoading}>
                                        <SendIcon />
                                    </IconButton>
                                    <Button onClick={cancelEditMode} color="secondary" variant="outlined">
                                        Cancel
                                    </Button>
                                </>
                            )

                        ) : (
                            <>
                                <IconButton onClick={() => enterEditMode(index, triplet)}>
                                    <EditIcon />
                                </IconButton>
                                {isEditingLoading ? (
                                    <CircularProgress />
                                ) : (
                                    <IconButton onClick={() => deleteTriplet(triplet, true)}>
                                        <DeleteIcon />
                                    </IconButton>
                                )}
                            </>

                        )}

                    </Box>
                );
            })}
        </div>
    );
};

export default TripletDisplay;
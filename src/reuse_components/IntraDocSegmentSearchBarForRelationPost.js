import {BACKEND_URL} from "../Api";
import {BACKEND_ERR} from "../utils/Errors";
import React, {useEffect, useState} from 'react';
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    IconButton,
    List,
    ListItem,
    Table, TableBody, TableCell, TableHead, TableRow,
    TextField
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FileDisplay from "../file_management/FileDisplay";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

export const IntraDocSegmentSearchBarForRelationPost = ({   segments,
                                                            filetype,
                                                            isEntityPropertyPair,
                                                            refreshTrigger,
                                                            setRefreshTrigger,
                                                            triggerSnackbar
}) => {
    const [isAdditionLoading, setIsAdditionLoading] = useState(false)

    const [newSubject, setNewSubject] = useState(null)
    const [newPredicate, setNewPredicate] = useState(isEntityPropertyPair ? 'hasProperty': '')
    const [newObject, setNewObject] = useState(null)
    const [newPropertyText, setNewPropertyText] = useState("")

    const [searchQuery, setSearchQuery] = useState('')
    const [filteredSegments, setFilteredSegments] = useState([])

    useEffect(() => {
        if (searchQuery === "") { setFilteredSegments([]) }
        else if (searchQuery === "ALL") {
            setFilteredSegments(segments);
        }
        else {
            setFilteredSegments(
                segments.filter(segment =>
                    segment.labels.some(label => label.toLowerCase().includes(searchQuery.toLowerCase()))
                )
            );
        }

    }, [searchQuery, segments]);

    const addToSubject = (segment) => setNewSubject(segment);
    const addToObject = (segment) => setNewObject(segment);
    const clearSubject = () => setNewSubject(null);
    const clearObject = () => setNewObject(null);

    const doAddNewTriplet = async () => {
        setIsAdditionLoading(true)
        const correctNewObject = isEntityPropertyPair ? newPropertyText : newObject.url
        const correctNewPredicate = newPredicate.startsWith("<http://megras.org/schema#") ? newPredicate : "<http://megras.org/schema#" + newPredicate + ">"
        let options = {
            method: 'POST',
            body: JSON.stringify({
                "quads" : [{
                    "s": newSubject.url,
                    "p": correctNewPredicate,
                    "o": correctNewObject
                }]
            })
        }
        let response = await fetch(BACKEND_URL + "/add/quads", options)
            .catch(() => triggerSnackbar(BACKEND_ERR + 'Error when adding triplet', "error"))
        if (response === undefined) return

        setIsAdditionLoading(false)
        clearSubject()
        clearObject()
        setNewPredicate(isEntityPropertyPair ? 'hasProperty': '')
        setNewPropertyText('')
        setSearchQuery('')
        setRefreshTrigger(!refreshTrigger)
    }

    return (
        <>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                    label='Search Segments by Label (Type "ALL" to Show All Segments)'
                    variant="outlined"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    fullWidth
                    margin="normal"
                />
                <IconButton onClick={() => setSearchQuery("")}>
                    <CloseIcon />
                </IconButton>
            </div>

            {filteredSegments.length > 0 &&
                <List>
                    <div style={{'fontSize': '0.8rem', 'fontStyle': 'italic', 'margin': '0px 0px 5px 5px'}}>
                        {isEntityPropertyPair ? (
                            <span> Tip: Click "To Subject" to add segments for property addition </span>
                            ) : (
                            <span> Tip: Click "To Subject" or "To Object" to add segments for relation addition </span>
                        )}
                    </div>
                    {filteredSegments.map((segment, index) => (
                        <ListItem key={index} sx={{border: "solid", borderWidth: "0.1px", borderColor: "gray"}}>
                            <Box sx={{width: "15%", height: "15%"}}>
                                <FileDisplay isPreview filedata={segment.url.replace("<", "").replace(">", "")} filetype={filetype} />
                            </Box>
                            <Box sx={{width: "15%", height: "15%"}}>
                                {segment.labels.map((label, index) => (
                                    <Chip key={index} label={label} variant="outlined" />
                                ))}
                            </Box>
                            <Button sx={{width: "25%", height: "15%", marginLeft: "3%"}}
                                    variant="outlined"
                                    onClick={() => addToSubject(segment)}
                                    disabled={newSubject === segment || newObject === segment}
                            >
                                To Subject
                            </Button>
                            {!isEntityPropertyPair &&
                                <Button sx={{width: "25%", height: "15%", marginLeft: "3%"}}
                                        variant="outlined"
                                        onClick={() => addToObject(segment)}
                                        disabled={newSubject === segment || newObject === segment}
                                >
                                    To Object
                                </Button>
                            }
                        </ListItem>
                    ))}
                </List>
            }
            { (newSubject || newObject || newPropertyText !== "") &&
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><h3>New Subject</h3></TableCell>
                            <TableCell><h3>New Predicate</h3></TableCell>
                            <TableCell><h3>New Object</h3></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            {/* Subject Segment */}
                            <TableCell sx={{ width: "20%", height: "20%" }}>
                                {newSubject && (
                                    <ListItem>
                                        <Box>
                                            <FileDisplay isPreview filedata={newSubject.url.replace("<", "").replace(">", "")} filetype={filetype} />
                                        </Box>
                                        <Box>
                                            {newSubject.labels.map((label, index) => (
                                                <Chip key={index} label={label} variant="outlined" />
                                            ))}
                                        </Box>
                                        <IconButton onClick={clearSubject}><DeleteIcon /></IconButton>
                                    </ListItem>
                                )}
                            </TableCell>
                            <TableCell sx={{ width: "20%", height: "20%" }}>
                                <TextField
                                    value={newPredicate}
                                    onChange={(e) => setNewPredicate(e.target.value)}
                                    disabled={isEntityPropertyPair}
                                />
                            </TableCell>

                            {/* Object Segment or Property Text */}
                            <TableCell sx={{ width: "20%", height: "20%" }}>
                                {isEntityPropertyPair ? (
                                    <TextField
                                        value={newPropertyText}
                                        onChange={(e) => setNewPropertyText(e.target.value)}
                                    />
                                    ) : (
                                        newObject && (
                                            <ListItem>
                                                <Box>
                                                    <FileDisplay isPreview filedata={newObject.url.replace("<", "").replace(">", "")} filetype={filetype} />
                                                </Box>
                                                <Box>
                                                    {newObject.labels.map((label, index) => (
                                                        <Chip key={index} label={label} variant="outlined" />
                                                    ))}
                                                </Box>
                                                <IconButton onClick={clearObject}><DeleteIcon /></IconButton>
                                            </ListItem>
                                        )
                                    )
                                }
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            }
            <Button
                variant="contained"
                color='secondary'
                startIcon={isAdditionLoading? <CircularProgress size={24} /> : <AddIcon size={24} />}
                onClick={doAddNewTriplet}
                disabled={!newSubject || !newPredicate || (!newObject && newPropertyText === "")}
            >
                Add Triplet
            </Button>
        </>
    )

}
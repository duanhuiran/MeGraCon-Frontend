import {
    TableCell,
    TableRow,
    TextField,
    Button,
    List,
    ListItem,
    IconButton,
    Box,
    Chip,
    Table,
    TableBody,
    TableHead,
    CircularProgress,
    Tooltip
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { BACKEND_URL, MEGRA_CON_URL } from "../Api";
import DeleteIcon from '@mui/icons-material/Delete';
import FileDisplay from "../file_management/FileDisplay";
import CloseIcon from "@mui/icons-material/Close";
import CallMergeIcon from '@mui/icons-material/CallMerge';
import InfoIcon from "@mui/icons-material/Info";

export const SegmentFusionButton = ({
                                        objectId,
                                        filetype,
                                        segments,
                                        refreshTrigger,
                                        setRefreshTrigger,
                                        triggerSnackbar
                                    }) => {
    const [fusionLoading, setFusionLoading] = useState(false);
    const [primarySegment, setPrimarySegment] = useState(null);
    const [secondarySegments, setSecondarySegments] = useState([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [filteredSegments, setFilteredSegments] = useState([]);


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

    if (!filetype || segments.length <= 0) return (<></>);
    if (filetype && filetype.startsWith('text')) return (<></>);

    const doSegmentMerge = async () => {
        setFusionLoading(true)
        const requestBody = [primarySegment.url.replace("<", "").replace(">", "")].concat(secondarySegments.map(e => e.url.replace("<", "").replace(">", "")));
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        };

        const url = new URL(`${MEGRA_CON_URL}/merge/segments`);
        let response = await fetch(url.toString(), requestOptions)
            .catch(() => triggerSnackbar("Error when merging segments.", "error"));
        if (!response) return;

        setSearchQuery('')
        clearPrimary()
        setSecondarySegments([])
        setRefreshTrigger(!refreshTrigger);
        setFusionLoading(false)
    };

    const addToPrimary = (segment) => setPrimarySegment(segment);
    const addToSecondary = (segment) => setSecondarySegments([...secondarySegments, segment]);
    const removeFromSecondary = (segment) => setSecondarySegments(
        secondarySegments.filter(s => s.url !== segment.url)
    );
    const clearPrimary = () => setPrimarySegment(null);

    return (
        <TableRow>
            <TableCell style={{ verticalAlign: 'top' }}>
                Segment Fusion
                <Tooltip
                    title="Merge redundant segments. The primary segment will be kept, and secondary segments will be deleted. While the relation quads (except metadata) of the secondary segments will be transferred to the primary segment.">
                    <IconButton>
                        <InfoIcon style={{ fontSize: '1rem' }}/>
                    </IconButton>
                </Tooltip>
            </TableCell>
            <TableCell>
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
                            Tip: Click "To Primary" or "To Secondary" to add segments for fusion
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
                                        onClick={() => addToPrimary(segment)}
                                        disabled={primarySegment === segment}
                                >
                                    To Primary
                                </Button>
                                <Button sx={{width: "25%", height: "15%", marginLeft: "3%"}}
                                        variant="outlined"
                                        onClick={() => addToSecondary(segment)}
                                        disabled={primarySegment === segment || secondarySegments.includes(segment)}
                                >
                                    To Secondary
                                </Button>
                            </ListItem>
                        ))}
                    </List>
                }

                { (primarySegment || secondarySegments.length > 0) &&
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><h3>Primary Segment</h3></TableCell>
                                <TableCell><h3>Secondary Segments</h3></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                {/* Primary Segment */}
                                <TableCell>
                                    {primarySegment && (
                                        <ListItem>
                                            <Box sx={{ width: "30%", height: "30%" }}>
                                                <FileDisplay isPreview filedata={primarySegment.url.replace("<", "").replace(">", "")} filetype={filetype} />
                                            </Box>
                                            <Box sx={{ width: "30%", height: "30%" }}>
                                                {primarySegment.labels.map((label, index) => (
                                                    <Chip key={index} label={label} variant="outlined" />
                                                ))}
                                            </Box>
                                            <IconButton onClick={clearPrimary}><DeleteIcon /></IconButton>
                                        </ListItem>
                                    )}
                                </TableCell>

                                {/* Secondary Segments */}
                                <TableCell>
                                    <List>
                                        {secondarySegments.map((segment, index) => (
                                            <ListItem key={index}>
                                                <Box sx={{ width: "30%", height: "30%" }}>
                                                    <FileDisplay isPreview filedata={segment.url.replace("<", "").replace(">", "")} filetype={filetype} />
                                                </Box>
                                                <Box sx={{ width: "30%", height: "30%" }}>
                                                    {segment.labels.map((label, labelIndex) => (
                                                        <Chip key={labelIndex} label={label} variant="outlined" />
                                                    ))}
                                                </Box>
                                                <IconButton onClick={() => removeFromSecondary(segment)}><DeleteIcon /></IconButton>
                                            </ListItem>
                                        ))}
                                    </List>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                }


                <Button
                    variant="contained"
                    color='secondary'
                    startIcon={fusionLoading? <CircularProgress size={24} /> : <CallMergeIcon size={24} />}
                    onClick={doSegmentMerge}
                    disabled={!primarySegment || secondarySegments.length === 0}
                >
                    Fusion
                </Button>
            </TableCell>
        </TableRow>
    );
};

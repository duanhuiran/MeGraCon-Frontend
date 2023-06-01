import React, { useState } from 'react';
import { BACKEND_URL, MEGRA_CON_URL } from "../Api";
import { MEGRA_CON_ERR } from "../utils/Errors";
import {
    Box,
    TableCell,
    TableRow,
    Button,
    Select,
    MenuItem,
    TextField,
    Checkbox,
    ListItem,
    List
} from "@mui/material";
import FileDisplay from "../file_management/FileDisplay";
import DeleteIcon from "@mui/icons-material/Delete";
import CallMergeIcon from "@mui/icons-material/CallMerge";

const selectOf = (s) => {
    let uri = s.replace(BACKEND_URL, "");
    window.open(uri, '_blank');
};

export const SimilarSegments = ({ objectId, similarSegments, setSimilarSegments,
                                    refreshTrigger, setRefreshTrigger, triggerSnackbar}) => {
    const objectUrl = BACKEND_URL + "/" + objectId

    const [selectedUrls, setSelectedUrls] = useState([]);

    const toggleSelect = (url) => {
        setSelectedUrls((prev) =>
            prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
        );
    };

    const groupSelectedUrlsToCluster = async () => {
        const allSelectedUrls = selectedUrls
        allSelectedUrls.push(objectUrl)
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(allSelectedUrls),
        };
        const url = new URL(`${MEGRA_CON_URL}/reidentification/clusters`);
        let response = await fetch(url.toString(), requestOptions)
            .catch(() => triggerSnackbar("clustering error", "error"));
        if (!response || !response.ok) { return; }
        setSelectedUrls([])
        setSimilarSegments([])
        setRefreshTrigger(!refreshTrigger);
    };

    return (
        <Box>
            {similarSegments.length > 0 && (
                <List>
                    <div style={{ fontSize: '0.8rem', fontStyle: 'italic', margin: '0px 0px 5px 5px' }}>
                        Tip: Click on the checkbox to select or deselect segments.
                    </div>
                    {similarSegments.map((segment, index) => (
                        <ListItem
                            key={index}
                            sx={{
                                border: "solid",
                                borderWidth: "0.1px",
                                borderColor: "gray",
                                display: "flex",
                                alignItems: "center",
                                padding: "10px",
                                height: "100px",
                            }}
                        >
                            {/* CheckBox for selecting */}
                            <Checkbox
                                checked={selectedUrls.includes(segment.obj_url)}
                                onChange={() => toggleSelect(segment.obj_url)}
                            />
                            {/* File display */}
                            <Box sx={{ height: "100%", marginLeft: "10px", cursor: "pointer"}}
                                 onClick={() => selectOf(segment.obj_url)}>
                                <FileDisplay isPreview filedata={segment.obj_url} filetype={'image'} />
                            </Box>
                            {/* Distance display */}
                            <Box sx={{ marginLeft: "20px", fontSize: "0.9rem" }}>
                                Distance: {segment.distance.toFixed(2)}
                            </Box>
                        </ListItem>
                    ))}
                </List>
            )}
            <Button
                variant="contained"
                color='secondary'
                startIcon={<CallMergeIcon size={24} />}
                onClick={groupSelectedUrlsToCluster}
                disabled={selectedUrls.length === 0}
            >
                Mark as a reidentification cluster
            </Button>
        </Box>
    );
};


export const ClusterMembersAndReID = ({ objectId, clusterId, setClusterId, triggerSnackbar,
                                          refreshTrigger, setRefreshTrigger,
                                          vertexaiEmbedding, clapEmbedding }) => {

    const objectUrl = BACKEND_URL + "/" + objectId;

    const [memberUrls, setMemberUrls] = useState([]);
    const [embeddingTypeOptions, setEmbeddingTypeOptions] = useState([]);
    const [selectedEmbeddingType, setSelectedEmbeddingType] = useState('');
    const [similarSegments, setSimilarSegments] = useState([]);
    const [knnCount, setKnnCount] = useState(100);
    const [distanceThreshold, setDistanceThreshold] = useState(0.5);

    React.useEffect(() => {
        const options = [];
        if (vertexaiEmbedding && vertexaiEmbedding.length > 0) {
            options.push('vertexaiEmbedding');
        }
        if (clapEmbedding && clapEmbedding.length > 0) {
            options.push('clapEmbedding');
        }
        setEmbeddingTypeOptions(options);
        if (options.length === 1) {
            setSelectedEmbeddingType(options[0])
        }

    }, [vertexaiEmbedding, clapEmbedding]);

    React.useEffect(() => {
        async function fetchMembers() {
            const requestOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            };
            const url = new URL(`${MEGRA_CON_URL}/reidentification/clusters/members`);
            url.searchParams.append('cluster_id', clusterId);
            let response = await fetch(url.toString(), requestOptions)
                .catch(() => triggerSnackbar(MEGRA_CON_ERR, "error"));
            if (!response || !response.ok) { return; }
            const data = await response.json();
            setMemberUrls(data.object_urls || []);
        }
        if (clusterId) {
            fetchMembers().then();
        } else {
            setMemberUrls([])
        }
    }, [clusterId, refreshTrigger]);

    const searchSimilarSegments = async () => {
        if (!selectedEmbeddingType || !embeddingTypeOptions.includes(selectedEmbeddingType)) {
            triggerSnackbar("Please select a valid embedding type.", "error");
            return;
        }

        const embeddingData = selectedEmbeddingType === 'vertexaiEmbedding' ? vertexaiEmbedding : clapEmbedding;

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(embeddingData),
        };

        const url = new URL(`${MEGRA_CON_URL}/query/knn/megracon`);
        url.searchParams.append('predicate', selectedEmbeddingType);
        url.searchParams.append('count', knnCount.toString());
        url.searchParams.append('threshold', distanceThreshold.toString());
        let response = await fetch(url.toString(), requestOptions)
            .catch(() => triggerSnackbar(MEGRA_CON_ERR, "error"));
        if (!response || !response.ok) { return; }
        const data = await response.json();

        const filteredAndSortedSegments = (data.results || [])
            .filter((segment) => segment.obj_url !== objectUrl && !memberUrls.includes(segment.obj_url))
            .sort((a, b) => a.distance - b.distance);

        setSimilarSegments(filteredAndSortedSegments);
    };

    const removeMemberFromCluster = async (member_url) => {
        const requestBody = [member_url];
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        };
        const url = new URL(`${MEGRA_CON_URL}/delete/reidentification/clusters/objects`);
        let response = await fetch(url.toString(), requestOptions)
            .catch(() => triggerSnackbar(MEGRA_CON_ERR, "error"));
        if (!response || !response.ok) { return; }
        if (objectUrl === member_url) { // remove self
            setClusterId(undefined)
        }
        setRefreshTrigger(!refreshTrigger);
    };

    return (
        <TableRow>
            <TableCell>
                ReID Cluster Members
                <br/>
                {memberUrls.includes(objectUrl) && (
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => removeMemberFromCluster(objectUrl)}
                        sx={{ marginTop: 2 }}
                    >
                        Remove Self
                    </Button>
                )}
            </TableCell>
            <TableCell>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {memberUrls.map((s) => (
                        <Box
                            key={s}
                            sx={{
                                cursor: 'pointer',
                                border: '1px solid #ccc',
                                padding: 1,
                                borderRadius: 1,
                                width: '150px',
                                height: '150px',
                                marginBottom: 2,
                                marginRight: "5%",
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                            }}
                        >
                            <Box
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                }}
                                onClick={() => selectOf(s)}>
                                <FileDisplay isPreview filedata={s} filetype={'image'} />
                            </Box>
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
                                    removeMemberFromCluster(s).then();
                                }}
                            />
                        </Box>
                    ))}
                </Box>
                <Box sx={{
                    marginTop: 2,
                    border: '1px solid #ccc',
                    padding: "2%"
                }}>
                    <Select
                        value={selectedEmbeddingType}
                        onChange={(e) => setSelectedEmbeddingType(e.target.value)}
                        displayEmpty
                        sx={{ marginRight: 2, marginTop: 1, width: "20%"}}
                    >
                        <MenuItem value="" disabled>
                            Select Embedding Type
                        </MenuItem>
                        {embeddingTypeOptions.map((type) => (
                            <MenuItem key={type} value={type}>
                                {type}
                            </MenuItem>
                        ))}
                    </Select>

                    <TextField
                        type="number"
                        label="KNN Count"
                        value={knnCount}
                        onChange={(e) => setKnnCount(Number(e.target.value))}
                        sx={{ marginRight: 2, marginTop: 1, width: "20%"}}
                    />
                    <TextField
                        type="number"
                        label="Distance Threshold"
                        value={distanceThreshold}
                        onChange={(e) => setDistanceThreshold(Number(e.target.value))}
                        inputProps={{ step: 0.1, min: 0, max: 2 }}
                        sx={{ marginRight: 2, marginTop: 1,width: "20%" }}
                    />
                    <Button
                        variant="contained"
                        color='secondary'
                        onClick={searchSimilarSegments}
                        sx={{ marginRight: 2, marginTop: 1, width: "20%" }}
                    >
                        Find Similar
                    </Button>


                </Box>
                <SimilarSegments
                    objectId={objectId}
                    similarSegments={similarSegments}
                    setSimilarSegments={setSimilarSegments}
                    refreshTrigger={refreshTrigger}
                    setRefreshTrigger={setRefreshTrigger}
                    triggerSnackbar={triggerSnackbar}
                />
            </TableCell>
        </TableRow>
    );
};



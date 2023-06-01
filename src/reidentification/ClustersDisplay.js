import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, List } from "@mui/material";
import FileDisplay from "../file_management/FileDisplay";
import {BACKEND_URL, MEGRA_CON_URL} from "../Api";
import {BACKEND_ERR} from "../utils/Errors";

export const ClustersDisplay = ({ triggerSnackbar }) => {
    const [clusters, setClusters] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchClusters = async () => {
            setLoading(true);
            const url = `${MEGRA_CON_URL}/reidentification/clusters`;
            try {
                const response = await fetch(url)
                    .catch(() => triggerSnackbar(BACKEND_ERR + 'Error when fetching clusters', "error"));
                if (!response.ok) {
                    return
                }
                const data = await response.json();
                setClusters(data.results || []);
            } catch (error) {
                triggerSnackbar("Failed to fetch clusters", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchClusters().then();
    }, [triggerSnackbar]);

    return (
        <Box sx={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px", marginTop: "20px" }}>
            <h2>Overview of ReID Clusters</h2>
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100px" }}>
                    <CircularProgress />
                </Box>
            ) : (
                <List>
                    {clusters.map((cluster) => (

                        <Box
                            key={cluster.cluster_id}
                            sx={{
                                marginBottom: "20px",
                                padding: "10px",
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                backgroundColor: "#f9f9f9",
                            }}
                        >
                            Cluster ID: {cluster.cluster_id}
                            <Box sx={{ marginBottom: "10px", fontSize: "1rem", fontWeight: "bold" }}>
                                <FileDisplay
                                    isPreview
                                    filedata={`Cluster ID: ${cluster.cluster_id}`}
                                    filetype="text"
                                />
                            </Box>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                {cluster.object_urls.map((url, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            width: "150px",
                                            height: "150px",
                                            cursor: "pointer",
                                            border: "1px solid #ccc",
                                            borderRadius: "4px",
                                            overflow: "hidden",
                                        }}
                                        onClick={() => {
                                            let frontend_uri = url.replace(BACKEND_URL, "");
                                            window.open(frontend_uri, "_blank")
                                        }}
                                    >
                                        <FileDisplay isPreview filedata={url} filetype="image" />
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    ))}
                </List>
            )}
        </Box>
    );
};

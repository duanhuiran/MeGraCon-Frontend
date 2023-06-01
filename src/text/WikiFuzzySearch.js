import React, { useState } from 'react';
import { TextField, List, ListItem, ListItemText, CircularProgress, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';


const WIKIDATA_API_URL = 'https://www.wikidata.org/w/api.php';

function FuzzySearch({ initialInputValue, onSelect }) {
    const [inputValue, setInputValue] = useState(initialInputValue);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchWikidataItems = async (query) => {
        setLoading(true);
        try {
            const url = new URL(WIKIDATA_API_URL);
            url.search = new URLSearchParams({
                action: "wbsearchentities",
                search: query,
                language: "en",
                format: "json",
                origin: "*"
            }).toString();

            const response = await fetch(url.toString());
            const data = await response.json();

            if (Array.isArray(data.search)) {
                setResults(data.search);
            } else {
                setResults([]);
            }
        } catch (error) {
            console.error('Error fetching data from Wikidata:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (inputValue) {
            fetchWikidataItems(inputValue).then();
        }
    };

    const handleResultClick = (wikiId) => {
        onSelect(wikiId);
        setResults([]);
        setInputValue('');
    };

    const onClose = () => {
        setResults([]);
        setInputValue('');
    }

    return (
        <div style={{ position: 'relative', margin: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                    label="Search for Wikidata Item (then click to add or replace)"
                    variant="outlined"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    fullWidth
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSearch();
                        }
                    }}
                />
                <IconButton
                    variant="contained"
                    color="primary"
                    onClick={handleSearch}
                    disabled={loading}
                >
                    <ManageSearchIcon />
                </IconButton>
                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>

            </div>

            {loading ? (
                <CircularProgress style={{ margin: '20px 0' }} />
            ) : (
                results.length > 0 && (
                    <List
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            backgroundColor: 'white',
                            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                            zIndex: 1000,
                            width: '100%',
                            border: "3px solid #ddd",
                        }}
                    >
                        {results.map((item) => (
                            <ListItem key={item.id}
                                      sx={{
                                          "&:hover": {
                                              backgroundColor: "#f0f0f0",
                                          },
                                          "cursor": "pointer"
                                      }}
                                      onClick={() => handleResultClick(item.id)}>
                                <ListItemText
                                    primary={<span style={{ fontWeight: 'bold', color: '#1976d2' }}>{item.id}</span>}
                                    secondary={<span><strong>{item.label}</strong> - {item.description}</span>}
                                />
                            </ListItem>
                        ))}
                    </List>
                )
            )}

        </div>
    );
}

export default FuzzySearch;

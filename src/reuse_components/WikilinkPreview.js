import React, { useState } from 'react';
import {Box, Chip} from '@mui/material';

const WikiLinkWithPreview = ({ wikiId }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <div style={{ margin: "10px", position: "relative" }}>
            <Box
                component="a"
                href={`https://www.wikidata.org/wiki/${wikiId}`}
                target="_blank"
                rel="noopener noreferrer"
                clickable
                sx={{
                    fontWeight: 'bold',
                    color: 'blue',
                    textDecoration: 'underline',
                }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {wikiId}
            </Box>

            {hovered && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        width: '50vw',
                        height: '50vh',
                        zIndex: 1000,
                    }}
                >
                    <iframe
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                        src={`https://www.wikidata.org/wiki/${wikiId}`}
                        style={{ width: '100%', height: '100%' }}
                        title={`Preview of ${wikiId}`}
                    />
                </div>
            )}
        </div>
    );
};

export default WikiLinkWithPreview;

import React from 'react';
import { Box } from '@mui/material';
import ReactPlayer from "react-player";
import { pdfjs } from 'react-pdf';
import ReactAudioPlayer from 'react-audio-player';
import { Typography } from '@mui/material';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url,
).toString();

const FileDisplay = ({ filetype, filedata, isPreview = false }) => {

    const [textContent, setTextContent] = React.useState('');

    React.useEffect(() => {
        if (filetype === "text/plain") {
            const fetchTextFile = async () => {
                try {
                    const response = await fetch(filedata);
                    const text = await response.text();
                    setTextContent(text);
                } catch (error) {
                    console.error("Error fetching text file:", error);
                }
            };

            fetchTextFile().then();
        }
    }, [filedata, filetype]);


    const displayFile = () => {

        if (filetype.startsWith("image")) {
            return <img
                src={filedata}
            />
        } else if (filetype.startsWith("video")) {
            return <ReactPlayer
                url={filedata}
                controls
            />
        }  else if (filetype.startsWith("audio")) {
            return <ReactAudioPlayer
                src={filedata}
                controls
            />
        }  else if (filetype.startsWith("text/plain")) {
            // Render plain text
            return <iframe
                src={filedata}
                style={{
                    width: '60%',
                    height: 'auto',
                    minHeight: '30vh',
                    maxHeight: '50vh',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    margin: '20px auto',
                    display: 'block',
                    backgroundColor: '#fff',
                    padding: '20px'
                }}
                title="Text file preview"
            />
        }
    }

    const previewFile = () => {
        if (filetype.startsWith("image") || filetype.startsWith("video") || filetype.startsWith("audio")) {
            return <img
                height='100%'
                width='100%'
                src={filedata + "/preview"}
                style={{ objectFit: 'scale-down' }}
            />
        } else if (filetype === "text/plain") {
            return (
                <Box
                    style={{
                        height: '100%',
                        width: '100%',
                        padding: '5%',
                    }}
                >
                    <Typography
                        style={{
                            width: '100%',
                            height: '100%',
                            align: 'left',
                            lineHeight: '1.6',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontSize: "9px" }}>
                        {textContent}
                    </Typography>
                </Box>
            )
        }
    }

    return (isPreview ? previewFile() : displayFile())
}


export default FileDisplay;
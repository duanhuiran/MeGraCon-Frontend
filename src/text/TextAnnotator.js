import { BACKEND_URL } from "../Api";
import React, { useState, useEffect, useRef } from 'react';
import Button from '@mui/material/Button';
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { BACKEND_ERR } from "../utils/Errors";
import { useNavigate } from "react-router";
import { CircularProgress } from "@mui/material";

function TextAnnotator({ triggerSnackbar, id }) {
    const textUrl = BACKEND_URL + "/" + id;
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [text, setText] = useState('');
    const [selection, setSelection] = useState({ start: null, end: null, selectedText: '' });
    const selectionBoxRef = useRef(null);

    useEffect(() => {
        fetch(textUrl)
            .then(response => response.text())
            .then(data => setText(data))
            .catch(error => {
                console.error('Error fetching the text:', error);
                triggerSnackbar('Failed to load text resource');
            });
    }, [textUrl, triggerSnackbar]);

    const handleMouseUp = () => {
        const selection = window.getSelection();
        const start = selection.anchorOffset;
        const end = selection.focusOffset;
        const selectedText = selection.toString();
        if (start !== end) {
            setSelection({start, end, selectedText});
        } else {
            setSelection({ start: null, end: null, selectedText: '' });
        }
    };

    const addSegmentation = async () => {
        const segUrl = `${textUrl}/segment/character/${selection.start}-${selection.end}`;
        if (selection.start !== null && selection.end !== null) {
            setLoading(true);
            let response = await fetch(segUrl).catch(() => triggerSnackbar(BACKEND_ERR, "error"));
            if (response.ok) {
                setLoading(false);
                navigate(response.url.replace(BACKEND_URL, ""));
            }
        }
    };

    const handleMoveSelectionBox = (e) => {
        const selectionBox = selectionBoxRef.current;
        const offsetX = e.clientX - selectionBox.getBoundingClientRect().left;
        const offsetY = e.clientY - selectionBox.getBoundingClientRect().top;

        const mouseMoveHandler = (e) => {
            selectionBox.style.left = `${e.clientX - offsetX}px`;
            selectionBox.style.top = `${e.clientY - offsetY}px`;
        };

        const mouseUpHandler = () => {
            window.removeEventListener('mousemove', mouseMoveHandler);
            window.removeEventListener('mouseup', mouseUpHandler);
        };

        window.addEventListener('mousemove', mouseMoveHandler);
        window.addEventListener('mouseup', mouseUpHandler);
    };

    const containerStyle = {
        margin: '20px auto',
        padding: '20px',
        maxWidth: '800px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    };

    const textStyle = {
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        lineHeight: '1.6',
        textAlign: 'left',
        color: '#333',
        whiteSpace: 'pre-wrap',
    };

    const selectionBoxStyle = {
        textAlign: 'left',
        position: 'fixed',
        width: "300px",
        top: '20px',
        left: '20px',
        padding: '10px',
        backgroundColor: '#ffffff',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
        zIndex: 1000,
        cursor: 'move',
    };

    return (
        <div style={containerStyle}>
            <p style={textStyle} onMouseUp={handleMouseUp}>
                {text}
            </p>
            <div
                style={selectionBoxStyle}
                ref={selectionBoxRef}
                onMouseDown={handleMoveSelectionBox}
            >
                <span>Range: {selection.start !== null ? selection.start : ''} - {selection.end !== null ? selection.end : ''}</span>
                <div style={{ marginTop: '10px' }}>
                    <strong>Selected Text:<br /></strong> {selection.selectedText || ''}
                </div>
                <Button
                    variant="contained"
                    color="primary"
                    style={{ marginLeft: '10px', marginTop: '10px' }}
                    onClick={addSegmentation}
                    disabled={selection.start === null || selection.end === null}
                >
                    {loading ? <CircularProgress size={24} /> : <CheckBoxIcon />}
                </Button>
            </div>
        </div>
    );
}

export default TextAnnotator;

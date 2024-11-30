import { editor } from '@overlapmedia/imagemapper';
import React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Box, Slider, TextField } from '@mui/material';
import HighlightAltIcon from '@mui/icons-material/HighlightAlt';
import PentagonIcon from '@mui/icons-material/Pentagon';
import RectangleIcon from '@mui/icons-material/Rectangle';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import captureVideoFrame from "capture-video-frame";
import ReactPlayer from "react-player";
import { BACKEND_URL } from '../Api';


function VideoRotoscopeAnnotator({ id, segment }) {
    const videoUrl = BACKEND_URL + "/" + id

    const elementRef = React.useRef(null);
    const playerRef = React.useRef(null);

    const [myEditor, setMyEditor] = React.useState();
    const [shape, setShape] = React.useState();
    const [mode, setMode] = React.useState("select");

    const [width, setWidth] = React.useState();
    const [height, setHeight] = React.useState();

    const [ready, setReady] = React.useState(false);
    const [image, setImage] = React.useState()
    const [slider, setSlider] = React.useState(0)
    const [rotoscope, setRotoscope] = React.useState([]);

    React.useEffect(() => {
        if (elementRef.current) {
            const myEditor = editor(elementRef.current, {
                componentDrawnHandler: (d) => {
                    setShape(d)
                    setMode("select")
                    myEditor.selectMode()
                    console.log(d)
                }
            });

            setMyEditor(myEditor);
            myEditor.loadImage(image);
            myEditor.selectMode();
        }
    }, [image]);

    React.useEffect(() => {
        const frame = captureVideoFrame(playerRef.current.getInternalPlayer())

        const img = new Image();
        img.onload = function () {
            setWidth(this.width)
            setHeight(this.height)
        }
        img.src = frame.dataUri;

        setImage(frame.dataUri)
    }, [ready])

    const setTime = (x) => {
        setSlider(x)
        playerRef.current.seekTo(x / 100)
        const frame = captureVideoFrame(playerRef.current.getInternalPlayer())
        setImage(frame.dataUri)
    }

    function select() {
        myEditor.selectMode()
        setMode("select")
    }

    const draw = (type) => {
        if (type === "rectangle") {
            myEditor.rect()
        } else if (type === "polygon") {
            myEditor.polygon()
        }
        setMode(type)
    }

    const clear = () => {
        if (shape !== undefined) {
            const x = myEditor.getComponentById(shape.element.id)
            if (x !== undefined) {
                myEditor.removeComponent(x)
                setShape();
            }
        }
    }

    const confirm = () => {
        let timestamp = 1000 * slider / 100 * playerRef.current.getDuration()
        var newRotoscope;
        if (shape.dim !== undefined) {
            const x = shape.dim.x
            const w = shape.dim.width
            const h = shape.dim.height
            const y = height - shape.dim.y - h
            newRotoscope = timestamp + ",rect," + x + "," + (x + w) + "," + y + "," + (y + h)
        } else if (shape.points !== undefined) {
            var points = []
            for (var i = 0; i < shape.points.length; i++) {
                points.push("(" + shape.points[i].x + "," + (height - shape.points[i].y) + ")")
            }
            newRotoscope = timestamp + ",polygon," + points.join(",")
        }
        console.log(newRotoscope)
        setRotoscope([...rotoscope, { ts: timestamp, uri: newRotoscope }])
        clear()
    }

    const complete = () => {
        rotoscope.sort((a, b) => parseFloat(a.ts) - parseFloat(b.ts))
        const url = videoUrl + "/segment/rotoscope/" + rotoscope.map(r => r.uri).join(";")
        segment(url)
    }

    return (
        <>
            <ReactPlayer
                style={{ display: 'none' }}
                ref={playerRef}
                url={videoUrl}
                playing={false}
                onReady={() => setReady(true)}
                onProgress={p => setSlider(100 * (p.playedSeconds / p.loadedSeconds))}
                config={{
                    file: {
                        attributes: {
                            crossOrigin: 'anonymous'
                        }
                    }
                }}
            />
            <Slider value={slider} onChange={(e, v) => setTime(v)} style={{ width: '40%' }} />
            {ready && width && height &&
                <Stack spacing={2} direction="row">
                    <Stack spacing={2} direction="column" justifyContent="space-between">
                        <Stack spacing={2}>
                            <Button variant={mode === "select" ? "contained" : "text"} onClick={() => select()}><HighlightAltIcon /></Button>
                            <Button variant={mode === "polygon" ? "contained" : "text"} disabled={shape !== undefined} onClick={() => draw("polygon")}><PentagonIcon /></Button>
                            <Button variant={mode === "rectangle" ? "contained" : "text"} disabled={shape !== undefined} onClick={() => draw("rectangle")}><RectangleIcon /></Button>
                            <Button onClick={clear}><DeleteIcon /></Button>
                            <Button variant="contained" onClick={() => confirm()}><AddIcon /></Button>
                        </Stack>
                        <Button variant="contained" color='secondary' disabled={rotoscope.length == 0} onClick={() => complete()}><CheckBoxIcon /></Button>
                    </Stack>
                    <Stack spacing={2} direction="column">
                        <svg id='svg'
                            ref={elementRef}
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            width={width}
                            height={height}
                            viewBox={`0, 0, ${width}, ${height}`}
                            preserveAspectRatio="xMinYMin"
                        >
                            <image href={image} width={width} height={height} />
                        </svg>
                    </Stack>
                </Stack>
            }
        </>
    );
}

export default VideoRotoscopeAnnotator;
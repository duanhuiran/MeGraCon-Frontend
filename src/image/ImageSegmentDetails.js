import React from 'react';
import { Stage, Layer, Rect, Text, Image, Label, Tag } from 'react-konva';
import useImage from 'use-image';
import { BACKEND_ERR } from '../utils/Errors';
import { BACKEND_URL } from '../Api';
import { useNavigate } from 'react-router';

const SegmentImage = ({ url, x, y, opacity }) => {
    const [image] = useImage(url);
    return <Image image={image} x={x} y={y} opacity={opacity} />;
};

const ImageSegmentDetails = (props) => {
    const { triggerSnackbar, objectId, loading, setLoading, details, limitSegments, transparent = false, hideEmpty = false } = props

    const navigate = useNavigate();

    const stageref = React.useRef();
    const tooltipref = React.useRef();
    const tooltiptextref = React.useRef();

    const [image, imageStatus] = useImage(BACKEND_URL + "/" + objectId);

    const [segments, setSegments] = React.useState([])
    const [highlightSegment, setHighlight] = React.useState()

    const [showImage, setShowImage] = React.useState(true)

    React.useEffect(() => {
        async function fetchSegments() {
            let options = {
                method: 'POST',
                body: JSON.stringify({
                    "s": [],
                    "p": ["<http://megras.org/schema#segmentOf>"],
                    "o": ["<" + BACKEND_URL + "/" + objectId + ">"]
                })
            }
            let response = await fetch(BACKEND_URL + "/query/quads", options)
                .catch(() => triggerSnackbar(BACKEND_ERR, "error"))
            if (response === undefined) return
            let data = await response.json()

            let segmentURIs = data.results.map(d => d.s)

            let relevantSegments = limitSegments ? segmentURIs.filter(v => limitSegments.includes(v)) : segmentURIs;
            if (hideEmpty && relevantSegments.length === 0) {
                setShowImage(false)
            }

            // 获取 segments 的 category 和 segmentBounds
            options = {
                method: 'POST',
                body: JSON.stringify({
                    "s": relevantSegments,
                    "p": ["<https://schema.org/category>", "<http://megras.org/schema#segmentBounds>"],
                    "o": []
                })
            }
            response = await fetch(BACKEND_URL + "/query/quads", options)
                .catch(() => triggerSnackbar(BACKEND_ERR, "error"))
            if (response === undefined) return
            data = await response.json()

            const groupedMap = new Map();
            for (const e of data.results) {
                if (!groupedMap.has(e.s)) {
                    groupedMap.set(e.s, { category: "", x: "", y: "", w: "", h: "" });
                }
                if (e.p === "<https://schema.org/category>") {
                    groupedMap.get(e.s)["category"] = e.o.replace("^^String", "")
                } else if (e.p === "<http://megras.org/schema#segmentBounds>") {
                    let bounds = e.o.replace("^^String", "").split(",")
                    groupedMap.get(e.s)["x"] = Number(bounds[0])
                    groupedMap.get(e.s)["y"] = image.height - Number(bounds[3])
                    groupedMap.get(e.s)["w"] = Number(bounds[1]) - Number(bounds[0])
                    groupedMap.get(e.s)["h"] = Number(bounds[3]) - Number(bounds[2])
                }
            }

            console.log(data)

            setSegments(Array.from(groupedMap, ([url, properties]) => ({ url, ...properties })))
        }

        if (imageStatus === "loaded") {
            fetchSegments().then();
            setLoading(false);
            return () => { }
        }
    }, [imageStatus])

    const toggleSegment = (idx) => {
        if (highlightSegment === idx) {
            setHighlight()
        } else {
            setHighlight(idx)
            let segment = segments[idx]
            tooltiptextref.current.text(segment.category)
            tooltipref.current.x(segment.x)
            tooltipref.current.y(segment.y)
            tooltipref.current.visible(segment.category !== "")
        }
    }

    const selectSegment = () => {
        let segment = segments[highlightSegment]
        if (segment) {
            let uri = segment.url.replace("<" + BACKEND_URL, "").replace(">", "")
            return navigate(uri)
        }
    }

    return (
        <>
            {imageStatus === "loaded" && showImage ?
                <>
                    <Stage ref={stageref} width={image.width} height={image.height}>
                        <Layer>
                            <Image image={image} opacity={transparent || highlightSegment !== undefined ? 0.3 : 1} />
                            {segments.map((s, i) => (
                                <>
                                    <SegmentImage
                                        url={s.url.replace("<", "").replace(">", "")}
                                        x={s.x} y={s.y}
                                        opacity={transparent || highlightSegment === i ? 1 : 0}
                                    />
                                    <Rect x={s.x} y={s.y}
                                        width={s.w} height={s.h}
                                        onMouseOver={(e) => {
                                            toggleSegment(i)
                                            const container = e.target.getStage().container();
                                            container.style.cursor = "pointer";
                                        }}
                                        onMouseOut={(e) => {
                                            toggleSegment(i)
                                            const container = e.target.getStage().container();
                                            container.style.cursor = "default";
                                        }}
                                        onClick={selectSegment}
                                        stroke="red"
                                        visible={highlightSegment === undefined || highlightSegment === i}
                                    />
                                </>
                            ))}
                        </Layer>
                        <Layer visible={highlightSegment !== undefined}>
                            <Label ref={tooltipref} >
                                <Tag fill='#37d2c6'></Tag>
                                <Text ref={tooltiptextref} text='' color="white" padding={5} fontSize={18} />
                            </Label>
                        </Layer>
                    </Stage>
                </>
                :
                null
            }
            <br />
            {details}
        </>
    )
}

export default ImageSegmentDetails;
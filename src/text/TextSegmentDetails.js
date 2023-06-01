import React from 'react';
import { BACKEND_URL } from "../Api";
import { BACKEND_ERR } from "../utils/Errors";
import { Box } from "@mui/material";

const TextSegmentDetails = (props) => {
    const { triggerSnackbar, segments, objectId, setLoading, details } = props;

    const [textSegments, setTextSegments] = React.useState([]);
    const [textContent, setTextContent] = React.useState("");

    React.useEffect(() => {
        async function fetchSpanAndWikiId() {
            const segmentUrls = segments.map((s) => s.url);
            let options = {
                method: 'POST',
                body: JSON.stringify({
                    "s": segmentUrls,
                    "p": ["<http://www.wikidata.org/prop/direct/P180>", "<http://megras.org/schema#segmentBounds>"],
                    "o": []
                })
            };
            let response = await fetch(BACKEND_URL + "/query/quads", options)
                .catch(() => triggerSnackbar(BACKEND_ERR, "error"));
            if (response === undefined) return;
            let data = await response.json();

            const groupedMap = new Map();

            data.results.forEach((e) => {
                if (!groupedMap.has(e.s)) {
                    groupedMap.set(e.s, { wikiId: "", start: "", end: "" });
                }
                if (e.p === "<http://www.wikidata.org/prop/direct/P180>") {
                    groupedMap.get(e.s)["wikiId"] = e.o.replace("^^String", "");
                } else if (e.p === "<http://megras.org/schema#segmentBounds>") {
                    let bounds = e.o.replace("^^String", "").split(",");
                    groupedMap.get(e.s)["end"] = Number(bounds[7]);
                    groupedMap.get(e.s)["start"] = Number(bounds[6]);
                }
            });

            setTextSegments(
                Array.from(groupedMap.entries())
                    .map(([url, values]) => ({
                        start: values.start,
                        end: values.end,
                        url: url,
                        objId: url.replace("<", "").replace(">", "").replace(BACKEND_URL, ""),
                        wikiId: values.wikiId
                    }))
                    .sort((a, b) => {
                        if (a.start === b.start) {
                            return b.end - a.end;
                        }
                        return a.start - b.start;
                    })
            );
        }

        async function fetchTextContent() {
            const response = await fetch(`${BACKEND_URL}/${objectId}`)
                .catch(() => triggerSnackbar(BACKEND_ERR, "error"));
            if (response) {
                const text = await response.text();
                setTextContent(text);
            }
        }

        if (segments) {
            fetchSpanAndWikiId().then();
            fetchTextContent().then();
        }

        setLoading(false);
    }, [objectId, segments]);

    function renderAnnotatedText(segments, startIdx, endIdx, depth = 0, renderedRanges = []) {
        if (!segments || !textContent) return null;

        const annotatedText = [];
        let currentIndex = startIdx;

        segments.forEach((segment, index) => {
            if (isAlreadyRendered(segment.start, segment.end, renderedRanges)) {
                return;
            }
            if (segment.start > currentIndex) {
                annotatedText.push(
                    <span key={`plain-${currentIndex}-${index}`}>
                        {renderTextWithLineBreaks(textContent.slice(currentIndex, segment.start))}
                    </span>
                );
            }
            const nestedSegments = segments.filter(
                (s) => (s.start > segment.start && s.end <= segment.end) || (s.start >= segment.start && s.end < segment.end)
            );

            annotatedText.push(
                <span
                    key={`highlighted-${segment.start}-${index}`}
                    style={{
                        backgroundColor: segment.wikiId
                            ? depth % 2 === 0
                                ? "lightgreen"
                                : "green"
                            : "yellow",
                        border: "1px solid black",
                        display: "inline",
                    }}
                    title={segment.wikiId ? `WikiId: ${segment.wikiId}` : "No WikiId"}
                    onClick={() => {
                        const url = `${segment.objId}`;
                        window.open(url, "_blank");
                    }}
                >
                    {renderAnnotatedText(nestedSegments, segment.start, segment.end, depth + 1, renderedRanges)}
                </span>
            );

            renderedRanges.push([segment.start, segment.end]);
            currentIndex = segment.end;
        });

        if (currentIndex < endIdx) {
            annotatedText.push(
                <span key={`plain-${currentIndex}-end`}>
                    {renderTextWithLineBreaks(textContent.slice(currentIndex, endIdx))}
                </span>
            );
        }

        return annotatedText;
    }

    function isAlreadyRendered(start, end, renderedRanges) {
        return renderedRanges.some(([rStart, rEnd]) => rStart <= start && rEnd >= end);
    }

    function renderTextWithLineBreaks(text) {
        return text.split("\n").map((line, index) => (
            <React.Fragment key={index}>
                {line}
                {index < text.split("\n").length - 1 && <br />}
            </React.Fragment>
        ));
    }

    return (
        <>
            <Box
                sx={{
                    width: '60%',
                    height: 'auto',
                    maxHeight: '50vh',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    margin: '20px auto',
                    display: 'block',
                    backgroundColor: '#fff',
                    padding: '20px',
                    overflowY: 'auto',
                    textAlign: 'left',
                    wordWrap: 'break-word'
                }}
            >
                <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                    {renderAnnotatedText(textSegments, 0, textContent.length, 0, [])}
                </pre>
            </Box>
            <br />
            {details}
        </>
    );
};

export default TextSegmentDetails;

import React from 'react';
import FileDisplay from './file_management/FileDisplay';
import { BACKEND_URL } from './Api';


const MediaSegmentDetails = (props) => {
    const { triggerSnackbar, objectId, loading, setLoading, filetype, filename, details } = props

    React.useEffect(() => {
        setLoading(false);
        return () => { }
    }, [])

    return (
        <>
            <FileDisplay
                filedata={BACKEND_URL + "/" + objectId}
                filetype={filetype}
            />
            <br />
            {!loading && details}
        </>
    )
}

export default MediaSegmentDetails;
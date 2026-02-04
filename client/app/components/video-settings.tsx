import IOSSwitch from "./ios-switch";

const VideoSettings = () =>{
    return (
        <div className="control-options" style={{ height: "200px", width: "240px", flexDirection: "column", gap: "20px", alignItems: "flex-start", justifyContent: "flex-start", padding: "20px", borderRadius: "10px" }}>
            <span className="control-options-text" style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                Auto Play<IOSSwitch label="Autoplay" name="Autoplay" size="small" />
            </span>
            <span className="control-options-text" style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                Quality
                <select id="qualitySelect" value="" style={{ backgroundColor: "transparent", border: "2px", padding: "4px", color: "white" }}>
                    <option style={{ color: "gray" }} value="">Auto</option>
                    <option style={{ color: "gray" }} value={"stream_3"}>360p</option>
                    <option style={{ color: "gray" }} value={"stream_2"}>480p</option>
                    <option style={{ color: "gray" }} value={"stream_1"}>720p</option>
                    <option style={{ color: "gray" }} value={"stream_0"}>1080p</option>
                </select>
            </span>
        </div>
    );
}

export default VideoSettings;
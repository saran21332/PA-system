import React, { useState, useRef, useEffect } from "react";
import { GoogleMap, LoadScriptNext, Marker, InfoWindow } from "@react-google-maps/api";
import pin from "../../assets/pin.png";
import pin2 from "../../assets/pin2.png";
import { getSpeakerGroups } from "../../api/speakerapi";

const mapCenter = { lat: 13.844727413987032, lng: 100.63332859049297 };
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const markers = [
  { id: 1, position: { lat: 13.84460549115163, lng: 100.6335549710659 } },
  { id: 2, position: { lat: 13.844662785440768, lng: 100.63320360170248} },
  { id: 3, position: { lat: 13.844733101139939, lng: 100.63304803358739 } },
];

const ShowSpeakerMap = () => {
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const [speakerGroups, setSpeakerGroups] = useState([]);
  const hoverTimeoutRef = useRef(null);

  useEffect(() => {
    getSpeakerGroups()
      .then((res) => {
        if (res.data?.data) setSpeakerGroups(res.data.data);
      })
      .catch((err) => console.error("❌ Fetch speaker groups error:", err));
  }, []);

  const handleMarkerMouseOver = (marker) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredMarker(marker);
  };

  const handleMarkerMouseOut = () => {
    hoverTimeoutRef.current = setTimeout(() => setHoveredMarker(null), 100);
  };

  const handleInfoWindowMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  const handleInfoWindowMouseLeave = () => setHoveredMarker(null);

  const getGroupStatus = (speakers) => {
    if (!speakers || speakers.length === 0) return "-";
    const allOnline = speakers.every(s => s.is_online);
    const allOffline = speakers.every(s => !s.is_online);
    if (allOnline) return "Online";
    if (allOffline) return "Offline";
    return "Problem";
  };

  const getGroupStatusClass = (speakers) => {
    const status = getGroupStatus(speakers);
    if (status === "Online") return "text-green-500";
    if (status === "Offline") return "text-red-500";
    return "text-yellow-500";
  };

  return (
    <div className="bg-white mt-5 rounded-lg p-4 shadow-2xl flex flex-col w-full h-full max-h-[96%] min-h-0 overflow-hidden">
      <div className="mb-3">
        <h3 className="text-xl text-left font-semibold text-gray-800 prompt-bold">แผนที่ลำโพง</h3>
      </div>

      <div className="relative w-full rounded-lg border border-gray-200 overflow-hidden bg-white flex-1 min-h-0">
        <LoadScriptNext googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
          <GoogleMap mapContainerStyle={{ width: "100%", height: "100%" }} center={mapCenter} zoom={20}>
            {markers.map((marker) => (
              <Marker
                key={marker.id}
                position={marker.position}
                icon={{ url: marker.id === 1 ? pin2 : pin }}
                onMouseOver={() => handleMarkerMouseOver(marker)}
                onMouseOut={handleMarkerMouseOut}
                options={{ clickable: true }}
              />
            ))}

            {hoveredMarker && (
              <InfoWindow
                position={hoveredMarker.position}
                options={{
                  disableAutoPan: true,
                  pixelOffset: new window.google.maps.Size(0, -110),
                  closeBoxURL: "",
                  enableEventPropagation: true,
                }}
              >
                <div
                  className="relative group"
                  onMouseEnter={handleInfoWindowMouseEnter}
                  onMouseLeave={handleInfoWindowMouseLeave}
                  style={{ minWidth: '160px', fontFamily: 'inherit' }}
                >
                  <div className="text-left text-sm text-gray-800 mb-1 font-medium">
                    {speakerGroups.find(g => g.id === hoveredMarker.id)?.group_name || "-"}
                  </div>
                  <div className="text-xs mb-1 text-left">
                    <span className="text-gray-600">สถานะ : </span>
                    <span className={getGroupStatusClass(
                      speakerGroups.find(g => g.id === hoveredMarker.id)?.speakers
                    )}>
                      {getGroupStatus(speakerGroups.find(g => g.id === hoveredMarker.id)?.speakers)}
                    </span>
                  </div>
                  <div className="absolute left-1/2 -bottom-3 transform -translate-x-1/2">
                    <svg width="32" height="12" viewBox="0 0 32 12">
                      <polygon points="0,0 16,12 32,0" className="fill-white stroke-gray-200" />
                    </svg>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScriptNext>
      </div>
    </div>
  );
};

export default ShowSpeakerMap;

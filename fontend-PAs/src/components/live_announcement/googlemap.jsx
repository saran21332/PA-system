import React, { useState, useEffect, useRef } from "react";
import { GoogleMap, LoadScriptNext, Marker, InfoWindow } from "@react-google-maps/api";
import pin from "../../assets/pin.png";
import pinCorrcet from "../../assets/pin-correct.png";
import pin2 from "../../assets/pin2.png";
import pin2Correct from "../../assets/pin2-correct.png";
import { getSpeakerGroups } from "../../api/speakerapi";
import AnnouncementControlPanel from "./AnnouncementControl";
import { usePlaylistStore } from "../../store/playlistStore";

const mapCenter = { lat: 13.844727413987032, lng: 100.63332859049297 };
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const markers = [
  { id: 1, position: { lat: 13.84460549115163, lng: 100.6335549710659 } },
  { id: 2, position: { lat: 13.844662785440768, lng: 100.63320360170248 } },
  { id: 3, position: { lat: 13.844733101139939, lng: 100.63304803358739 } },
];

const MapsComponent = ({ onFloorPlanClick, onSpeakerGroupSelect }) => {
  const { selectedGroupId, setSelectedGroupId } = usePlaylistStore();
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const hoverTimeoutRef = useRef(null);
  const [speakerGroups, setSpeakerGroups] = useState([]);
  const [checkedSpeakers, setCheckedSpeakers] = useState(new Set());
  const [showAnnouncementPanel, setShowAnnouncementPanel] = useState(false);
  const [forceSelectGroupId, setForceSelectGroupId] = useState(null);

  useEffect(() => {
    getSpeakerGroups()
      .then((res) => setSpeakerGroups(res.data?.data || []))
      .catch((err) => console.error("Fetch speaker groups error:", err));
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

  const handleFloorPlan = () => {
    setHoveredMarker(null);
    if (onFloorPlanClick) onFloorPlanClick();
  };

  const handleMarkerClick = (marker) => {
    setSelectedGroupId(String(marker.id));
    if (onSpeakerGroupSelect) onSpeakerGroupSelect(marker.id);
  };

  const getGroupStatus = (speakers) => {
    if (!speakers || speakers.length === 0) return "-";
    const allOnline = speakers.every((s) => s.is_online);
    const allOffline = speakers.every((s) => !s.is_online);
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
    <div className="bg-white mt-5 rounded-lg p-4 shadow-2xl flex flex-col w-full h-[820px] min-h-0 overflow-hidden">
      <div className="mb-3">
        <h3 className="text-xl text-left font-semibold text-gray-800 prompt-bold">แผนที่ลำโพง</h3>
      </div>

      <div className="relative w-full rounded-lg border border-gray-200 overflow-hidden bg-white flex-1 min-h-0">
        <LoadScriptNext googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
          <GoogleMap mapContainerStyle={{ width: "100%", height: "100%" }} center={mapCenter} zoom={20}>
            {markers.map((marker) => {
              const isSelected = String(marker.id) === String(selectedGroupId);
              let iconUrl;
              if (marker.id === 1) iconUrl = isSelected ? pin2Correct : pin2;
              else iconUrl = isSelected ? pinCorrcet : pin;

              return (
                <Marker
                  key={marker.id}
                  position={marker.position}
                  icon={{ url: iconUrl }}
                  onClick={() => handleMarkerClick(marker)}
                  onMouseOver={() => handleMarkerMouseOver(marker)}
                  onMouseOut={handleMarkerMouseOut}
                />
              );
            })}

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
                  style={{ minWidth: "160px", fontFamily: "inherit" }}
                >
                  <div className="text-left text-sm prompt-regular text-gray-800 mb-1">
                    {speakerGroups.find((g) => g.id === hoveredMarker.id)?.group_name || "-"}
                  </div>

                  <div className="text-xs mb-1 text-left prompt-regular">
                    <span className="text-gray-600">สถานะ : </span>
                    <span
                      className={getGroupStatusClass(
                        speakerGroups.find((g) => g.id === hoveredMarker.id)?.speakers
                      )}
                    >
                      {getGroupStatus(speakerGroups.find((g) => g.id === hoveredMarker.id)?.speakers)}
                    </span>
                  </div>

                  <div className="pt-1">
                    {hoveredMarker.id === 1 && (
                      <button
                        onClick={handleFloorPlan}
                        className="bg-[#D1D3EE] rounded-xl w-full text-sm py-1 px-2 text-gray-600 hover:bg-purple-50 transition font-medium mb-2 cursor-pointer"
                      >
                        Floor Plan
                      </button>
                    )}
                    <button
                      onClick={() => handleMarkerClick(hoveredMarker)}
                      className="bg-[#D1D3EE] rounded-xl w-full text-sm py-1 px-2 text-gray-600 hover:bg-purple-50 transition font-medium cursor-pointer"
                    >
                      เพิ่มลำโพง
                    </button>
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

        {showAnnouncementPanel && (
          <div className="absolute right-2 top-2 w-[380px] max-w-full z-50 bg-white shadow-2xl rounded-xl">
            <AnnouncementControlPanel
              speakerGroups={speakerGroups}
              forceSelectGroupId={forceSelectGroupId}
              onForceSelectHandled={() => setForceSelectGroupId(null)}
              checkedSpeakers={checkedSpeakers}
              setCheckedSpeakers={setCheckedSpeakers}
              onClose={() => setShowAnnouncementPanel(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MapsComponent;

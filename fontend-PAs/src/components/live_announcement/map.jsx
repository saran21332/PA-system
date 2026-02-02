import React, { useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import floor1Image from "../../assets/floor1.jpg";
import floor2Image from "../../assets/floor2.jpg";
import floor3Image from "../../assets/floor3.jpg";
import pin from "../../assets/pin.png";
import pinCorrect from "../../assets/pin-correct.png";

const MapImageComponent = ({ onBackToGoogleMap, checkedFloors }) => {
  const [selectedFloor, setSelectedFloor] = useState(1);

  const floorImages = {
    1: floor1Image,
    2: floor2Image,
    3: floor3Image,
  };

  const markersByFloor = {
    1: [
      { id: 1, top: "35%", left: "35%" },
      { id: 2, top: "21%", left: "43%" },
      { id: 3, top: "22%", left: "63%" },
      { id: 4, top: "38%", left: "63%" },
      { id: 5, top: "24%", left: "85%" },
      { id: 6, top: "40%", left: "85%" },
      { id: 7, top: "50%", left: "30%" },
      { id: 8, top: "43%", left: "39%" },
      { id: 9, top: "53%", left: "39%" },
      { id: 10, top: "41%", left: "44%" },
      { id: 11, top: "47%", left: "50%" },
      { id: 12, top: "51%", left: "63%" },
      { id: 13, top: "57%", left: "60%" },
      { id: 14, top: "66%", left: "30%" },
      { id: 15, top: "78%", left: "30%" },
      { id: 16, top: "64%", left: "39%" },
      { id: 17, top: "76%", left: "39%" },
      { id: 18, top: "68%", left: "45%" },
      { id: 19, top: "64%", left: "51%" },
      { id: 20, top: "76%", left: "51%" },
      { id: 21, top: "70%", left: "68%" },
      { id: 22, top: "65%", left: "87%" },
      { id: 23, top: "72%", left: "81%" },
    ],
    2: [
      { id: 1, top: "23%", left: "32%" },
      { id: 2, top: "23%", left: "43%" },
      { id: 3, top: "23%", left: "55%" },
      { id: 4, top: "23%", left: "81%" },
      { id: 5, top: "44%", left: "15%" },
      { id: 6, top: "56%", left: "15%" },
      { id: 7, top: "66%", left: "15%" },
      { id: 8, top: "85%", left: "17%" },
      { id: 9, top: "85%", left: "30%" },
      { id: 10, top: "85%", left: "39%" },
      { id: 11, top: "85%", left: "46%" },
      { id: 12, top: "85%", left: "52%" },
      { id: 13, top: "85%", left: "58%" },
      { id: 14, top: "85%", left: "67%" },
      { id: 15, top: "68%", left: "83%" },
      { id: 16, top: "64%", left: "45%" },
      { id: 17, top: "64%", left: "60%" },
      { id: 18, top: "46%", left: "64%" },
      { id: 19, top: "46%", left: "51%" },
    ],
    3: [
      { id: 1, top: "17%", left: "66%" },
      { id: 2, top: "51%", left: "36%" },
      { id: 3, top: "51%", left: "53%" },
    ],
  };

  const markers = markersByFloor[selectedFloor] || [];

  return (
    <div className="bg-white rounded-lg p-4 mt-5 shadow-2xl h-full flex flex-col max-h-[92%] overflow-hidden">
      <div className="mb-3">
        <h3 className="text-xl text-left font-semibold text-gray-800 prompt-bold">
          แผนที่ลำโพง
        </h3>
      </div>

      <div className="flex gap-2 mb-3 flex-shrink-0">
        {[1, 2, 3].map((floor) => (
          <button
            key={floor}
            type="button"
            onClick={() => setSelectedFloor(floor)}
            className={`transition group flex h-10 w-32 items-center justify-center rounded-full text-sm prompt-regular duration-300 ${selectedFloor === floor
              ? "bg-gradient-to-r from-[#AD7CE1] to-[#EC77BA] p-[2px] hover:bg-gradient-to-l hover:shadow-2xl hover:shadow-purple-600/30 cursor-pointer"
              : "border border-gray-300 p-0 hover:border-gray-400 cursor-pointer"
              }`}
          >
            <div
              className={`flex h-full w-full items-center justify-center rounded-full transition duration-300 ease-in-out ${selectedFloor === floor
                ? "bg-white group-hover:bg-gradient-to-br group-hover:from-gray-50 group-hover:to-gray-100 cursor-pointer"
                : "bg-white group-hover:bg-gray-50 cursor-pointer"
                }`}
            >
              <span
                className={
                  selectedFloor === floor
                    ? "bg-gradient-to-r from-[#AD7CE1] to-[#EC77BA] bg-clip-text text-transparent"
                    : "text-gray-600"
                }
              >
                แพลนเน็ต ชั้น {floor}
              </span>
            </div>
          </button>
        ))}
        <button
          type="button"
          onClick={onBackToGoogleMap}
          className="transition text-white group flex h-10 w-32 items-center justify-center rounded-full text-sm prompt-regular duration-300 bg-gradient-to-r from-[#AD7CE1] to-[#EC77BA] p-[2px] hover:bg-gradient-to-l hover:shadow-2xl hover:shadow-purple-600/30 cursor-pointer"
        >
          กลับ Google Map
        </button>
      </div>

      <div className="relative w-full rounded-lg border border-gray-200 overflow-hidden bg-white flex-1">
        <TransformWrapper
          initialScale={1.2}
          minScale={1}
          maxScale={3}
          centerOnInit={true}
        >
          <TransformComponent
            wrapperClass="!w-full !h-full"
            contentClass="!w-full !h-full flex items-center justify-center"
          >
            <div className="relative">
              <img
                src={floorImages[selectedFloor]}
                alt={`ชั้น ${selectedFloor}`}
                className="max-w-full max-h-full object-contain"
                style={{
                  maxWidth: "90vw",
                  maxHeight: "60vh",
                  width: "auto",
                  height: "auto",
                }}
              />
              {markers.map(marker => (
                <div key={marker.id} className="absolute z-30 flex flex-col items-center"
                  style={{ top: marker.top, left: marker.left, transform: "translate(-50%, -50%)" }}>
                  <img
                    src={checkedFloors.has(selectedFloor) ? pinCorrect : pin}
                    alt={marker.id}
                    className="w-20 h-23 drop-shadow-lg"
                  />
                </div>
              ))}
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  );
};

export default MapImageComponent;
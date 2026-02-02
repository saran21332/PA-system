// import { useEffect, useState } from "react";
// import { getSpeakerGroups } from "../api/speakerapi";

// export const useSpeakerGroups = () => {
//   const [speakerGroups, setSpeakerGroups] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     getSpeakerGroups()
//       .then((res) => {
//         if (res.data?.data) {
//           setSpeakerGroups(res.data.data);
//         }
//       })
//       .catch((err) => {
//         console.error("❌ Error fetching speaker groups:", err);
//       })
//       .finally(() => setLoading(false));
//   }, []);

//   return { speakerGroups, loading };
// };

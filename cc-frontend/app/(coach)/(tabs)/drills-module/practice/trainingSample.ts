type StatKey = string;

type TrainingSample = {
  features: { [key in StatKey]: number }; // normalized attention scores -ranged from 0 to 1 nearest to 1 means more attention is needed
  labels: number[]; // drill IDs that worked well
};

const trainingSamples: TrainingSample[] = [
  {
    features: { FT_PCT: 0.6975, steals: 0.655, _2PTS_PCT: 0.5825 },
    labels: [8, 9, 11, 12],
  },
  {
    features: { points: 0.9225, assists: 0.89, REB: 0.8825 },
    labels: [1, 5, 6, 10, 11, 13],
  },
  {
    features: { _3PTS_PCT: 0.7575, turnovers: 0.645, FT_PCT: 0.6 },
    labels: [1, 2, 3, 4, 5, 6, 11, 12],
  },
  {
    features: { turnovers: 0.645, FG_PCT: 0.6075, REB: 0.6025 },
    labels: [1, 2, 3, 4, 5, 6, 7, 10, 12, 13],
  },
  {
    features: { turnovers: 0.645, steals: 0.465 },
    labels: [2, 3, 4, 5, 6, 8, 9],
  },
  {
    features: { blocks: 0.835, assists: 0.7025, points: 0.67 },
    labels: [1, 5, 6, 8, 9, 10, 11, 13],
  },
  { features: { FT_PCT: 0.7855, _2PTS_PCT: 0.5692 }, labels: [11, 12, 14, 18] },
  {
    features: { FT_PCT: 0.469, blocks: 0.413 },
    labels: [8, 9, 10, 11, 14, 15],
  },
  {
    features: { assists: 0.4291, blocks: 0.8426, points: 0.8435 },
    labels: [13, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 18],
  },
  {
    features: { assists: 0.3758, turnovers: 0.338 },
    labels: [2, 3, 4, 5, 6, 7, 13],
  },
  {
    features: { _2PTS_PCT: 0.8146, turnovers: 0.472 },
    labels: [2, 3, 4, 5, 6, 12, 18],
  },
  {
    features: { REB: 0.8484, points: 0.913 },
    labels: [1, 10, 11, 13, 14, 15, 16, 18],
  },
  {
    features: { FT_PCT: 0.7026, turnovers: 0.4111 },
    labels: [2, 3, 4, 5, 6, 11, 14],
  },
  { features: { FT_PCT: 0.7243, _3PTS_PCT: 0.5406 }, labels: [1, 11, 12, 14] },
  {
    features: { FG_PCT: 0.9627, FT_PCT: 0.2331, turnovers: 0.4443 },
    labels: [1, 2, 3, 4, 5, 6, 7, 11, 12, 13, 14, 16, 18],
  },
  { features: { FT_PCT: 0.7309, steals: 0.2453 }, labels: [8, 9, 11, 14, 17] },
  {
    features: { FG_PCT: 0.3076, assists: 0.4909, points: 0.5659 },
    labels: [13, 1, 7, 16, 18, 2, 3, 4, 5, 6, 11, 12, 14],
  },
  { features: { REB: 0.7734, blocks: 0.401 }, labels: [10, 15, 8, 9] },
  {
    features: { REB: 0.623, _3PTS_PCT: 0.3508, points: 0.6149 },
    labels: [1, 10, 11, 12, 13, 14, 15, 16, 18],
  },
  {
    features: { FT_PCT: 0.3654, blocks: 0.6471, turnovers: 0.493 },
    labels: [2, 3, 4, 5, 6, 8, 9, 10, 11, 14, 15],
  },
  { features: { FT_PCT: 0.6279, _3PTS_PCT: 0.9695 }, labels: [1, 11, 12, 14] },
  { features: { REB: 0.8461, _2PTS_PCT: 0.7069 }, labels: [10, 12, 15, 18] },
  {
    features: { FT_PCT: 0.4068, assists: 0.5175 },
    labels: [2, 3, 4, 5, 6, 7, 11, 13, 14],
  },
  {
    features: { FT_PCT: 0.9339, turnovers: 0.4379 },
    labels: [2, 3, 4, 5, 6, 11, 14],
  },
  { features: { FT_PCT: 0.826, _2PTS_PCT: 0.7836 }, labels: [11, 12, 14, 18] },
  {
    features: { FG_PCT: 0.4339, _2PTS_PCT: 0.5389, points: 0.422 },
    labels: [18, 1, 12, 13, 16, 7, 11, 14],
  },
  {
    features: { points: 0.8494, turnovers: 0.8315 },
    labels: [1, 2, 3, 4, 5, 6, 11, 13, 14, 16, 18],
  },
  {
    features: { FT_PCT: 0.8602, assists: 0.8906, points: 0.7104 },
    labels: [11, 13, 14, 1, 2, 3, 4, 5, 6, 7, 16, 18],
  },
  {
    features: { assists: 0.5115, steals: 0.3616 },
    labels: [2, 3, 4, 5, 6, 7, 8, 9, 13, 17],
  },
  {
    features: { FG_PCT: 0.3649, steals: 0.9004 },
    labels: [1, 7, 8, 9, 12, 13, 16, 17, 18],
  },
  {
    features: { _2PTS_PCT: 0.893, blocks: 0.3055 },
    labels: [8, 9, 10, 12, 15, 18],
  },
  {
    features: { assists: 0.9922, blocks: 0.4975 },
    labels: [2, 3, 4, 5, 6, 7, 8, 9, 10, 13, 15],
  },
  {
    features: { FT_PCT: 0.9188, blocks: 0.9669, points: 0.6065 },
    labels: [11, 14, 1, 8, 9, 10, 13, 15, 16, 18],
  },
  {
    features: { FG_PCT: 0.775, _2PTS_PCT: 0.2563 },
    labels: [12, 18, 1, 7, 13, 16],
  },
  {
    features: { _2PTS_PCT: 0.5704, turnovers: 0.7915 },
    labels: [2, 3, 4, 5, 6, 12, 18],
  },
  {
    features: { FT_PCT: 0.5452, _2PTS_PCT: 0.2775, points: 0.6242 },
    labels: [11, 14, 18, 1, 12, 13, 16],
  },
  {
    features: { FT_PCT: 0.869, _2PTS_PCT: 0.998, turnovers: 0.9285 },
    labels: [2, 3, 4, 5, 6, 11, 12, 14, 18],
  },
  {
    features: { FT_PCT: 0.68, _3PTS_PCT: 0.4526, points: 0.5381 },
    labels: [1, 11, 14, 12, 13, 16, 18],
  },
  {
    features: { points: 0.2145, turnovers: 0.8883 },
    labels: [1, 2, 3, 4, 5, 6, 11, 13, 14, 16, 18],
  },
  {
    features: { FG_PCT: 0.4626, blocks: 0.6198, steals: 0.7948 },
    labels: [8, 9, 1, 7, 10, 12, 13, 15, 16, 17, 18],
  },
  {
    features: { FG_PCT: 0.3316, blocks: 0.244 },
    labels: [1, 7, 8, 9, 10, 12, 13, 15, 16, 18],
  },
  {
    features: { _2PTS_PCT: 0.9326, blocks: 0.6578, points: 0.4015 },
    labels: [18, 1, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  },
  {
    features: { REB: 0.4739, assists: 0.3958, points: 0.6469 },
    labels: [13, 1, 2, 3, 4, 5, 6, 7, 10, 11, 14, 15, 16, 18],
  },
  {
    features: { blocks: 0.2786, turnovers: 0.5458 },
    labels: [2, 3, 4, 5, 6, 8, 9, 10, 15],
  },
  {
    features: { FG_PCT: 0.5643, REB: 0.9173, blocks: 0.4538 },
    labels: [10, 15, 1, 7, 8, 9, 12, 13, 16, 18],
  },
  {
    features: { FG_PCT: 0.8796, REB: 0.3446 },
    labels: [1, 7, 10, 12, 13, 15, 16, 18],
  },
  {
    features: { assists: 0.7879, points: 0.4935, steals: 0.5887 },
    labels: [13, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 14, 16, 17, 18],
  },
  {
    features: { points: 0.8313, turnovers: 0.5781 },
    labels: [1, 2, 3, 4, 5, 6, 11, 13, 14, 16, 18],
  },
  {
    features: { _2PTS_PCT: 0.8126, points: 0.9201 },
    labels: [18, 1, 11, 12, 13, 14, 16],
  },
  {
    features: { FG_PCT: 0.8394, _3PTS_PCT: 0.9077, steals: 0.3193 },
    labels: [1, 12, 7, 8, 9, 13, 16, 17, 18],
  },
  {
    features: { FG_PCT: 0.9323, REB: 0.2413, steals: 0.9002 },
    labels: [1, 7, 8, 9, 10, 12, 13, 15, 16, 17, 18],
  },
  {
    features: { FG_PCT: 0.8, FT_PCT: 0.3664, blocks: 0.2562 },
    labels: [1, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18],
  },
  {
    features: { assists: 0.6896, blocks: 0.5085, steals: 0.3468 },
    labels: [8, 9, 2, 3, 4, 5, 6, 7, 10, 13, 15, 17],
  },
  { features: { REB: 0.3373, blocks: 0.4596 }, labels: [10, 15, 8, 9] },
  {
    features: { _2PTS_PCT: 0.5521, steals: 0.3532, turnovers: 0.7491 },
    labels: [2, 3, 4, 5, 6, 8, 9, 12, 17, 18],
  },
  { features: { REB: 0.3056, steals: 0.573 }, labels: [8, 9, 10, 15, 17] },
  {
    features: { FT_PCT: 0.9067, points: 0.7335 },
    labels: [11, 14, 1, 13, 16, 18],
  },
  {
    features: { _3PTS_PCT: 0.2308, assists: 0.4225, blocks: 0.9566 },
    labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 15],
  },
  {
    features: { FT_PCT: 0.8382, _2PTS_PCT: 0.2804, _3PTS_PCT: 0.9331 },
    labels: [12, 1, 11, 14, 18],
  },
  {
    features: { _2PTS_PCT: 0.8509, blocks: 0.345, points: 0.5303 },
    labels: [18, 1, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  },
  {
    features: { REB: 0.9723, turnovers: 0.2329 },
    labels: [2, 3, 4, 5, 6, 10, 15],
  },
  {
    features: { FG_PCT: 0.8202, FT_PCT: 0.918, assists: 0.7614 },
    labels: [7, 13, 1, 2, 3, 4, 5, 6, 11, 12, 14, 16, 18],
  },
  {
    features: { FG_PCT: 0.8856, REB: 0.279, _3PTS_PCT: 0.9508 },
    labels: [1, 12, 7, 10, 13, 15, 16, 18],
  },
  { features: { FT_PCT: 0.3621, _2PTS_PCT: 0.3688 }, labels: [11, 12, 14, 18] },
  {
    features: { _3PTS_PCT: 0.8613, assists: 0.9331 },
    labels: [1, 2, 3, 4, 5, 6, 7, 12, 13],
  },
  {
    features: { FT_PCT: 0.6429, REB: 0.2255, turnovers: 0.6496 },
    labels: [2, 3, 4, 5, 6, 10, 11, 14, 15],
  },
  { features: { FT_PCT: 0.8462, steals: 0.6384 }, labels: [8, 9, 11, 14, 17] },
  {
    features: { _2PTS_PCT: 0.4164, assists: 0.4122, points: 0.3073 },
    labels: [13, 18, 1, 2, 3, 4, 5, 6, 7, 11, 12, 14, 16],
  },
  {
    features: { FG_PCT: 0.2235, points: 0.6784 },
    labels: [1, 13, 16, 18, 7, 11, 12, 14],
  },
  {
    features: { FG_PCT: 0.4125, _3PTS_PCT: 0.4094, assists: 0.8594 },
    labels: [1, 7, 12, 13, 2, 3, 4, 5, 6, 16, 18],
  },
  { features: { _2PTS_PCT: 0.7776, _3PTS_PCT: 0.6647 }, labels: [12, 1, 18] },
  {
    features: { FG_PCT: 0.2502, _3PTS_PCT: 0.2496, blocks: 0.6039 },
    labels: [1, 12, 7, 8, 9, 10, 13, 15, 16, 18],
  },
  {
    features: { REB: 0.8931, assists: 0.7629, blocks: 0.6541 },
    labels: [10, 15, 2, 3, 4, 5, 6, 7, 8, 9, 13],
  },
  {
    features: { FT_PCT: 0.27, blocks: 0.7068, turnovers: 0.8217 },
    labels: [2, 3, 4, 5, 6, 8, 9, 10, 11, 14, 15],
  },
  {
    features: { FG_PCT: 0.4033, _2PTS_PCT: 0.4876 },
    labels: [12, 18, 1, 7, 13, 16],
  },
  {
    features: { REB: 0.5221, _3PTS_PCT: 0.9265, steals: 0.3628 },
    labels: [1, 8, 9, 10, 12, 15, 17],
  },
  {
    features: { REB: 0.3883, points: 0.2298, steals: 0.6083 },
    labels: [1, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18],
  },
  {
    features: { FG_PCT: 0.6716, points: 0.8497 },
    labels: [1, 13, 16, 18, 7, 11, 12, 14],
  },
  {
    features: { FG_PCT: 0.5886, _2PTS_PCT: 0.2631 },
    labels: [12, 18, 1, 7, 13, 16],
  },
  {
    features: { _3PTS_PCT: 0.2256, points: 0.3151 },
    labels: [1, 11, 12, 13, 14, 16, 18],
  },
  {
    features: { _2PTS_PCT: 0.5949, steals: 0.8855, turnovers: 0.4653 },
    labels: [2, 3, 4, 5, 6, 8, 9, 12, 17, 18],
  },
  {
    features: { REB: 0.5989, turnovers: 0.3707 },
    labels: [2, 3, 4, 5, 6, 10, 15],
  },
  {
    features: { FG_PCT: 0.2326, points: 0.9056 },
    labels: [1, 13, 16, 18, 7, 11, 12, 14],
  },
  {
    features: { points: 0.6885, steals: 0.5163, turnovers: 0.3231 },
    labels: [1, 2, 3, 4, 5, 6, 8, 9, 11, 13, 14, 16, 17, 18],
  },
  {
    features: { _2PTS_PCT: 0.6104, steals: 0.5536 },
    labels: [8, 9, 12, 17, 18],
  },
  {
    features: { FG_PCT: 0.4114, blocks: 0.2318 },
    labels: [1, 7, 8, 9, 10, 12, 13, 15, 16, 18],
  },
  {
    features: { _3PTS_PCT: 0.9752, steals: 0.8558 },
    labels: [1, 8, 9, 12, 17],
  },
  {
    features: { _3PTS_PCT: 0.8291, points: 0.451, steals: 0.2806 },
    labels: [1, 8, 9, 11, 12, 13, 14, 16, 17, 18],
  },
  {
    features: { assists: 0.4762, points: 0.7702 },
    labels: [13, 1, 2, 3, 4, 5, 6, 7, 11, 14, 16, 18],
  },
  { features: { blocks: 0.9414, steals: 0.5364 }, labels: [8, 9, 10, 15, 17] },
  {
    features: { assists: 0.2548, points: 0.7156 },
    labels: [13, 1, 2, 3, 4, 5, 6, 7, 11, 14, 16, 18],
  },
  { features: { _2PTS_PCT: 0.991, _3PTS_PCT: 0.4459 }, labels: [12, 1, 18] },
  {
    features: { assists: 0.5068, steals: 0.9635 },
    labels: [2, 3, 4, 5, 6, 7, 8, 9, 13, 17],
  },
  {
    features: { FG_PCT: 0.2916, blocks: 0.8137, steals: 0.8399 },
    labels: [8, 9, 1, 7, 10, 12, 13, 15, 16, 17, 18],
  },
  {
    features: { FG_PCT: 0.5823, FT_PCT: 0.6129, REB: 0.249 },
    labels: [1, 7, 10, 11, 12, 13, 14, 15, 16, 18],
  },
  {
    features: { FG_PCT: 0.4598, REB: 0.9528, blocks: 0.2716 },
    labels: [10, 15, 1, 7, 8, 9, 12, 13, 16, 18],
  },
  {
    features: { blocks: 0.4192, turnovers: 0.6211 },
    labels: [2, 3, 4, 5, 6, 8, 9, 10, 15],
  },
  {
    features: { _3PTS_PCT: 0.3235, blocks: 0.8739 },
    labels: [1, 8, 9, 10, 12, 15],
  },
  {
    features: { _2PTS_PCT: 0.2996, _3PTS_PCT: 0.6308, assists: 0.6654 },
    labels: [12, 1, 2, 3, 4, 5, 6, 7, 13, 18],
  },
  {
    features: { FG_PCT: 0.2273, turnovers: 0.4117 },
    labels: [1, 2, 3, 4, 5, 6, 7, 12, 13, 16, 18],
  },
  {
    features: { assists: 0.7802, blocks: 0.8891, points: 0.7936 },
    labels: [13, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 18],
  },
  {
    features: { _3PTS_PCT: 0.501, points: 0.8147 },
    labels: [1, 11, 12, 13, 14, 16, 18],
  },
  {
    features: { REB: 0.4167, _2PTS_PCT: 0.5687, _3PTS_PCT: 0.6835 },
    labels: [12, 1, 10, 15, 18],
  },
  {
    features: { REB: 0.4315, turnovers: 0.3145 },
    labels: [2, 3, 4, 5, 6, 10, 15],
  },
  {
    features: { FG_PCT: 0.4583, points: 0.8113 },
    labels: [1, 13, 16, 18, 7, 11, 12, 14],
  },
  {
    features: { FG_PCT: 0.2107, FT_PCT: 0.3549, _3PTS_PCT: 0.804 },
    labels: [1, 12, 7, 11, 13, 14, 16, 18],
  },
];

export default trainingSamples;

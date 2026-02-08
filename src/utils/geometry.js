/**
 * Calculates the Euclidean distance between two points.
 * @param {object} p1 - Point 1 {x, y, z}
 * @param {object} p2 - Point 2 {x, y, z}
 * @returns {number} Distance
 */
export const calculateDistance = (p1, p2) => {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) + Math.pow(p1.z - p2.z, 2)
  );
};

/**
 * Determines if the mouth is open based on facial landmarks.
 * @param {object} landmarks - MediaPipe Face Mesh landmarks
 * @param {number} threshold - Threshold for mouth open ratio (default 0.05)
 * @returns {boolean} True if mouth is open
 */
export const isMouthOpen = (landmarks, threshold = 0.05) => {
  if (!landmarks) return false;

  // MediaPipe Face Mesh landmarks:
  // 13: Upper lip bottom
  // 14: Lower lip top
  // 10: Top of head (approximate) - actually 10 is top of forehead
  // 152: Chin
  
  const upperLipBottom = landmarks[13];
  const lowerLipTop = landmarks[14];
  const forehead = landmarks[10];
  const chin = landmarks[152];

  if (!upperLipBottom || !lowerLipTop || !forehead || !chin) return false;

  const mouthDistance = calculateDistance(upperLipBottom, lowerLipTop);
  const faceHeight = calculateDistance(forehead, chin);

  if (faceHeight === 0) return false;

  const ratio = mouthDistance / faceHeight;

  return ratio > threshold;
};

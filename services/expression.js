const smileCheck = (keypoints, state) => {
  const leftMouthCorner = keypoints[61];
  const rightMouthCorner = keypoints[308];
  const mouthWidth = Math.abs(rightMouthCorner.x - leftMouthCorner.x);

  const isCurrentlySmiling = mouthWidth > 90;

  return isCurrentlySmiling;
};

const blinkingCheck = (keypoints, state) => {
  const leftEyeBottom = keypoints[386];
  const leftEyeTop = keypoints[373];
  const leftEyeWidth = Math.abs(leftEyeBottom.y - leftEyeTop.y);

  const isBlinkingNow = leftEyeWidth < 8;
  // console.log(leftEyeWidth);

  return isBlinkingNow;
};

export { smileCheck, blinkingCheck };

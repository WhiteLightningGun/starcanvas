/**
 * Writes the current declination and right ascension values to lower left of canvas converted to degrees, hours, rounded to two decimals
 */
function writeCurrentDecRa(ref, Dec, Ra, xPos, yPos) {
  const canvas = ref.current;
  const context = canvas.getContext("2d");

  context.strokeStyle = "white";
  context.fillStyle = "white";
  context.fillText(
    `Dec: ${(Dec * 57.29577951).toFixed(2)} deg, Ra: ${(
      Ra * 3.819718634
    ).toFixed(2)} hours`,
    xPos,
    yPos
  );
}

export default writeCurrentDecRa;

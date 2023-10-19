async function LookUpID(id) {
  const response = await fetch(`stars/IDLookUp?id1=${id}`);
  const starData = await response.json();
  return starData;
}

export default LookUpID;

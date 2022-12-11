
module.exports = (obj) => {
  return !Object.values(obj).every(x => (x !== null && x !== ''));
};

//obj = { "op": "get", "name": "vishwa", "address": "No7 main road BLR", "mobile_no": '999999', "email": "abc@abc.com" }
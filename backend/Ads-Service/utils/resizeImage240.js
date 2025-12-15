const sharp = require("sharp");

const resizeImage240 = async (buffer) => {
  return await sharp(buffer)
    .resize(240, 240, {
      fit: "cover",
      position: "center",
    })
    .jpeg({ quality: 80 })
    .toBuffer();
};
module.exports = resizeImage240;

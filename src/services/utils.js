import SHA256 from "crypto-js/sha256";

const utils = {
  buildArtworkHash(artworkUrl) {
    if (artworkUrl && artworkUrl.length > 0) {
      return "0x" + SHA256(artworkUrl).toString();
    }
  }
};

export default utils;

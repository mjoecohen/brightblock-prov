import axios from "axios";
import provstore from "@/storage/provstore";

const bitcoinService = {
  register: function(data, success, failure) {
    return new Promise(resolve => {
      let command = "/bitcoin/register";
      let callInfo = {
        method: "post",
        url: provstore.state.constants.blockchainUrl + command,
        headers: {
          "Content-Type": "application/json"
        }
      };
      return new Promise((resolve, reject) => {
        axios
          .post(callInfo.url, data)
          .then(response => {
            if (response.failed) {
              reject(new Error(response.message));
            }
            resolve(response.data.details);
          })
          .catch(e => {
            reject(new Error(e.message));
          });
      });

    });
  }
};
export default bitcoinService;

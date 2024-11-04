import axios from "../axios";

export const apiLoginSuccess = (_id) =>
  new Promise(async (resolve, reject) => {
    try {
      let response = await axios({
        method: "post",
        url: "http://localhost:5000/api/auth/login-success",
        data: { _id },
      });
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });

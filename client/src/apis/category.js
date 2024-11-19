import axios from "../axios";

export const apiCreateCategory = (data) =>
  axios({
    url: "/prodcategory/",
    method: "post",
    data,
  });

export const apiGetAllCategories = (params) =>
  axios({
    url: "/prodcategory/all",
    method: "get",
    params,
  });

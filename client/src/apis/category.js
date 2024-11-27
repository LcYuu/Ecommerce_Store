import axios from "../axios";

export const apiCreateCategory = (data) =>
  axios({
    url: "/prodcategory/",
    method: "post",
    data,
  });

export const apiUpdateCategory = (data, pcid) =>
  axios({
    url: "/prodcategory/" + pcid,
    method: "put",
    data,
  });

export const apiDeleteCategory = (pcid) =>
  axios({
    url: "/prodcategory/" + pcid,
    method: "delete",
  });

export const apiGetAllCategories = (params) =>
  axios({
    url: "/prodcategory/all",
    method: "get",
    params,
  });

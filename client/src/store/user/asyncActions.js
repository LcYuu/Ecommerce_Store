import { createAsyncThunk } from "@reduxjs/toolkit";
import * as apis from "../../apis";
import { login } from "./userSlice";
import { apiLoginSuccess } from "apis/auth";

export const getCurrent = createAsyncThunk(
  "user/current",
  async (data, { rejectWithValue }) => {
    const response = await apis.apiGetCurrent();
    if (!response.success) return rejectWithValue(response);
    return response.rs;
  }
);

export const loginSuccess = (_id) => async (dispatch) => {
  try {
    const response = await apiLoginSuccess(_id);
    console.log(response);
    if (response.success) {
      dispatch(
        login({
          isLoggedIn: true,
          token: response.accessToken,
          userData: response.userData,
        })
      );
    } else {
      dispatch(
        login({
          isLoggedIn: false,
          token: null,
          userData: null,
        })
      );
    }
  } catch (error) {
    dispatch(
      login({
        isLoggedIn: false,
        token: null,
        userData: null,
      })
    );
  }
};

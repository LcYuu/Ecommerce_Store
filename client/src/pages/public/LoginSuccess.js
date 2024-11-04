import { loginSuccess } from "../../store/user/asyncActions";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useParams } from "react-router-dom";

const LoginSuccess = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(loginSuccess(userId));
  }, [dispatch, userId]);

  return <div>{isLoggedIn && <Navigate to={"/"} replace={true} />}</div>;
};

export default LoginSuccess;

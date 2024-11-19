import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import path from "ultils/path";
import { getCurrent } from "store/user/asyncActions";
import { useSelector, useDispatch } from "react-redux";
import icons from "ultils/icons";
import { logout, clearMessage } from "store/user/userSlice";
import Swal from "sweetalert2";
import { AiFillFacebook, AiFillInstagram, AiFillYoutube } from "react-icons/ai";

const { AiOutlineLogout } = icons;

const TopHeaders = () => {
  const { isLoggedIn, current, mes } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    const setTimeoutId = setTimeout(() => {
      if (isLoggedIn) dispatch(getCurrent());
    }, 300);

    return () => {
      clearTimeout(setTimeoutId);
    };
  }, [dispatch, isLoggedIn]);

  useEffect(() => {
    if (mes)
      Swal.fire("Oops!", mes, "info").then(() => {
        dispatch(clearMessage());
        navigate(`/${path.LOGIN}`);
      });
  }, [mes, dispatch, navigate]);
  return (
    <div className="w-full bg-main flex items-center justify-center">
      <div className="h-[48px] w-main flex items-center justify-between text-sm text-white">
        <div className="flex items-center">
          <a
            href="https://www.facebook.com/nmkla62"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AiFillFacebook size={30} />
          </a>
          <a
            href="https://www.instagram.com/nguyenminh3625/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AiFillInstagram size={30} />
          </a>
          <a
            href="https://www.youtube.com/@nguyenminhkhanh.la62"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AiFillYoutube size={30} />
          </a>
        </div>
        <span className="hidden md:inline-block">
          ORDER ONLINE OR CALL US (+84) 942802649
        </span>
        {isLoggedIn && current ? (
          <div className=" flex gap-4 w-full md:w-fit text-sm justify-between md:justify-start items-center">
            <span className="pl-2">{`Welcome, ${current?.lastname} ${current?.firstname}`}</span>
            <span
              onClick={() => dispatch(logout())}
              className="hover:rounded-full hover:bg-gray-200 cursor-pointer hover:text-main p-2"
            >
              <AiOutlineLogout size={18} />
            </span>
          </div>
        ) : (
          <Link className="hover:text-gray-800" to={`/${path.LOGIN}`}>
            Sign In or Create Account
          </Link>
        )}
      </div>
    </div>
  );
};

export default TopHeaders;

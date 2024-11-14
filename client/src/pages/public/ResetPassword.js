import React, { useState } from "react";
import { Button } from "../../components";
import { useNavigate, useParams } from "react-router-dom";
import { apiResetPassword } from "../../apis/user";
import { toast } from "react-toastify";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error(
        "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.",
        {
          theme: "colored",
        }
      );
      return false;
    }
    return true;
  };

  const handleResetPassword = async () => {
    if (!validatePassword(password)) return;

    if (password !== confirmPassword) {
      toast.error("Mật khẩu không trùng khớp!", { theme: "colored" });
      return;
    }

    const response = await apiResetPassword({ password, token });
    if (response.success) {
      toast.success(response.mes, { theme: "colored" });
      navigate("/");
    } else {
      toast.info(response.mes, { theme: "colored" });
    }
  };

  return (
    <div className="absolute animate-slide-right top-0 left-0 bottom-0 right-0 bg-gray-100 flex flex-col items-center py-12 z-50">
      <div className="bg-white shadow-lg rounded-lg p-8 w-[90%] max-w-[600px] flex flex-col gap-6 items-center">
        <h2 className="text-2xl font-semibold text-blue-600 mb-4">
          Đặt lại mật khẩu
        </h2>

        <label
          htmlFor="password"
          className="self-start text-gray-700 font-medium"
        >
          Nhập mật khẩu mới:
        </label>
        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </span>
        </div>

        <label
          htmlFor="confirmPassword"
          className="self-start text-gray-700 font-medium"
        >
          Nhập lại mật khẩu:
        </label>
        <div className="relative w-full">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            className="w-full px-4 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            placeholder="Xác nhận"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <span
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
          >
            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
          </span>
        </div>

        <div className="flex items-center justify-center w-full mt-6">
          <Button
            handleOnClick={handleResetPassword}
            style="px-8 py-3 rounded-full text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 font-semibold text-lg transition-all duration-300 shadow-md"
          >
            Thay đổi
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

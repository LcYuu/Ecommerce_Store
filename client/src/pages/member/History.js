import { apiGetOrders, apiGetUserOrders, apiUpdateStatus } from "apis";
import { CustomSelect, InputForm, Pagination } from "components";
import withBaseComponent from "hocs/withBaseComponent";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createSearchParams, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { statusOrders } from "ultils/contants";

const History = ({ navigate, location }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [counts, setCounts] = useState(0);
  const [params] = useSearchParams();
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useForm();
  const [status, setStatus] = useState(statusOrders[0].value);

  const fetchPOrders = async (params) => {
    const response = await apiGetUserOrders({
      ...params,
      limit: process.env.REACT_APP_LIMIT,
    });
    if (response.success) {
      setOrders(response.orders);
      setFilteredOrders(response.orders); // Initialize filteredOrders
      setCounts(response.counts);
    }
  };

  useEffect(() => {
    const pr = Object.fromEntries([...params]);
    fetchPOrders(pr);
  }, [params]);

  useEffect(() => {
    const currentStatus = watch("status");
    if (currentStatus) {
      setStatus(currentStatus);
    }
  }, [watch("status")]);

  const handleSearchStatus = (selectedOption) => {
    if (selectedOption && selectedOption.value) {
      setStatus(selectedOption.value);
      navigate({
        pathname: location.pathname,
        search: createSearchParams({ status: selectedOption.value }).toString(),
      });
    }
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setValue("q", searchTerm);

    // Filter orders based on the search term and exclude "Request Cancel" status
    const newFilteredOrders = orders.filter((order) =>
      order.products.some((product) =>
        product.title.toLowerCase().includes(searchTerm)
      ) && order.status !== "Request Cancel" // Exclude "Request Cancel" status
    );

    setFilteredOrders(newFilteredOrders);
  };

  const handleCancelOrder = async (orderId) => {
    Swal.fire({
      title: "Bạn có chắc chắn muốn yêu cầu hủy đơn hàng này?",
      text: "Yêu cầu hủy sẽ được gửi tới admin để xác nhận",
      icon: "warning", 
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Gửi yêu cầu",
      cancelButtonText: "Quay lại",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const data = { status: "Request Cancel" };
          const response = await apiUpdateStatus(orderId, data);
          
          if (response.success === true) {
            Swal.fire(
              "Đã gửi!",
              "Yêu cầu hủy đơn hàng đã được gửi tới admin.",
              "success"
            );
            fetchPOrders(Object.fromEntries([...params]));
          } else {
            Swal.fire(
              "Thất bại!",
              "Không thể gửi yêu cầu hủy. Vui lòng thử lại.",
              "error"
            );
          }
        } catch (error) {
          console.error("Error updating order status:", error);
          Swal.fire("Lỗi!", "Có lỗi xảy ra khi gửi yêu cầu hủy.", "error");
        }
      }
    });
  };

  const renderStatusMessage = (status, orderId) => {
    switch (status) {
      case 'Request Cancel':
        return (
          <div className="flex flex-col items-center">
            <span className="text-yellow-500">Đang chờ xác nhận hủy</span>
            <span className="text-xs text-gray-500">Yêu cầu đang được xử lý</span>
          </div>
        );
      case 'Cancel Rejected':
        return (
          <div className="flex flex-col items-center">
            <span className="text-red-500">Yêu cầu hủy đã bị từ chối</span>
            <button
              onClick={() => handleCancelOrder(orderId)}
              className="mt-2 px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-700 text-xs"
            >
              Gửi yêu cầu hủy mới
            </button>
          </div>
        );
      case 'Pending Approval':
        return (
          <div className="flex flex-col items-center">
            <span className="text-orange-500">Yêu cầu hủy đang chờ duyệt</span>
            <span className="text-xs text-gray-500">Vui lòng chờ admin xử lý</span>
          </div>
        );
      case 'Pending':
        return (
          <div className="flex flex-col items-center">
            {status}
            <button
              onClick={() => handleCancelOrder(orderId)}
              className="ml-4 px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-700"
            >
              Hủy
            </button>
          </div>
        );
      case 'Cancelled':
        return <span className="text-red-500">Cancelled</span>;
      default:
        return status;
    }
  };

  return (
    <div className="w-full relative px-4">
      <header className="text-3xl font-semibold py-4 border-b border-b-blue-200">
        History
      </header>
      <div className="flex justify-end items-center px-4">
        <form className="w-[45%] grid grid-cols-2 gap-4">
          <div className="col-span-1">
            <input
              id="q"
              {...register("q")}
              className="w-full h-[35px] border border-gray-300 rounded-md"
              placeholder="  Search orders by product name"
              onChange={handleSearch}
              value={watch("q") || ""}
            />
          </div>
          <div className="col-span-1 flex items-center">
            <CustomSelect
              placeholder={status}
              options={statusOrders}
              value={status}
              onChange={handleSearchStatus}
              wrapClassname="w-full"
              isSearchable={false}
              isDisabled={false}
            />
          </div>
        </form>
      </div>
      <table className="table-auto w-full">
        <thead>
          <tr className="border bg-sky-900 text-white border-white">
            <th className="text-center py-2">#</th>
            <th className="text-center py-2">Products</th>
            <th className="text-center py-2">Total</th>
            <th className="text-center py-2">Status</th>
            <th className="text-center py-2">Created At</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((el, idx) => (
            <tr className="border-b" key={el._id}>
              <td className="text-center py-2">
                {(+params.get("page") > 1 ? +params.get("page") - 1 : 0) *
                  process.env.REACT_APP_LIMIT +
                  idx +
                  1}
              </td>
              <td className="text-center max-w-[500px] py-2">
                <span className="grid grid-cols-4 gap-4">
                  {el.products.map((item) => (
                    <span
                      className="flex col-span-1 items-center gap-2"
                      key={item._id}
                    >
                      <img
                        src={item.thumbnail}
                        alt="thumb"
                        className="w-8 h-8 rounded-md object-cover"
                      />
                      <span className="flex flex-col">
                        <span className="text-main text-sm">{item.title}</span>
                        <span className="flex items-center text-xs gap-2">
                          <span>Quantity:</span>
                          <span className="text-main">{item.quantity}</span>
                        </span>
                      </span>
                    </span>
                  ))}
                </span>
              </td>
              <td className="text-center py-2">{el.total.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</td>
              <td className="text-center py-2">
                {renderStatusMessage(el.status, el._id)}
                {el.statusMessage && (
                  <span className="block text-xs text-gray-500 mt-1 italic">
                    {el.statusMessage}
                  </span>
                )}
              </td>
              <td className="text-center py-2">
                {moment(el.createdAt)?.format("DD/MM/YYYY")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="w-full flex justify-end my-8">
        <Pagination totalCount={counts} />
      </div>
    </div>
  );
};

export default withBaseComponent(History);

import { apiGetOrders, apiGetUserOrders } from "apis";
import { CustomSelect, InputForm, Pagination } from "components";
import withBaseComponent from "hocs/withBaseComponent";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createSearchParams, useSearchParams } from "react-router-dom";
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

    // Lọc các đơn hàng dựa trên từ khóa tìm kiếm
    const newFilteredOrders = orders.filter(order =>
      order.products.some(product =>
        product.title.toLowerCase().includes(searchTerm)
      )
    );

    setFilteredOrders(newFilteredOrders);
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
                    <span className="flex col-span-1 items-center gap-2" key={item._id}>
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
              <td className="text-center py-2">{el.total + " 💲"}</td>
              <td className="text-center py-2">{el.status}</td>
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

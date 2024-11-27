import {
  apiDeleteOrderByAdmin,
  apiGetOrders,
  apiUpdateCart,
  apiUpdateStatus,
} from "apis"
import { Button, InputForm, Pagination, CustomSelect } from "components"
import useDebounce from "hooks/useDebounce"
import moment from "moment"
import React, { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { BiCustomize, BiEdit } from "react-icons/bi"
import { RiDeleteBin6Line } from "react-icons/ri"
import {
  createSearchParams,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom"
import { toast } from "react-toastify"
import Swal from "sweetalert2"
import { formatMoney } from "ultils/helpers"

const ManageOrder = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useForm()
  const [orders, setOrders] = useState()
  const [counts, setCounts] = useState(0)
  const [update, setUpdate] = useState(false)
  const [editOrder, setEditOrder] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredOrders, setFilteredOrders] = useState(null);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Succeed', label: 'Succeeded' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];

  const fetchOrders = async (params) => {
    const response = await apiGetOrders({
      ...params,
      limit: process.env.REACT_APP_LIMIT,
    })
    if (response.success) {
      setCounts(response.counts)
      setOrders(response.orders)
    }
  }
  const render = useCallback(() => {
    setUpdate(!update)
  })
  const queryDecounce = useDebounce(watch("q"), 800)
  useEffect(() => {
    if (queryDecounce) {
      navigate({
        pathname: location.pathname,
        search: createSearchParams({ q: queryDecounce }).toString(),
      })
    } else
      navigate({
        pathname: location.pathname,
      })
  }, [queryDecounce])
  useEffect(() => {
    const searchParams = Object.fromEntries([...params])
    fetchOrders(searchParams)
  }, [params, update])
  const handleDeleteProduct = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Are you sure remove this order",
      icon: "warning",
      showCancelButton: true,
    }).then(async (rs) => {
      if (rs.isConfirmed) {
        const response = await apiDeleteOrderByAdmin(id)
        if (response.success) toast.success(response.mes)
        else toast.error(response.mes)
        render()
      }
    })
  }
  const handleUpdate = async () => {
    const response = await apiUpdateStatus(editOrder._id, {
      status: watch("status"),
    })
    if (response.success) {
      toast.success(response.mes)
      setUpdate(!update)
      setEditOrder(null)
  
    } else toast.error(response.mes)
  }
  const handleCancelRequest = async (orderId, action) => {
    const status = action === 'approve' ? 'Cancelled' : 'Pending';
    const message = action === 'approve' ? 
      'Bạn có chắc chắn muốn chấp nhận yêu cầu hủy đơn hàng này?' :
      'Bạn có chắc chắn muốn từ chối yêu cầu hủy đơn hàng này?';

    Swal.fire({
      title: "Xác nhận",
      text: message,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: action === 'approve' ? "#d33" : "#3085d6",
      cancelButtonColor: "#6c757d",
      confirmButtonText: action === 'approve' ? "Chấp nhận hủy" : "Từ chối hủy",
      cancelButtonText: "Quay lại",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await apiUpdateStatus(orderId, { status });
          
          if (response.success) {
            Swal.fire(
              "Thành công!",
              `Đã ${action === 'approve' ? 'chấp nhận' : 'từ chối'} yêu cầu hủy đơn hàng.`,
              "success"
            );
            fetchOrders(Object.fromEntries([...params]));
          }
        } catch (error) {
          Swal.fire("Lỗi!", "Có lỗi xảy ra. Vui lòng thử lại.", "error");
        }
      }
    });
  };
  const handleChangeStatus = async (orderId, selectedStatus) => {
    try {
      const response = await apiUpdateStatus(orderId, { 
        status: selectedStatus.value 
      });
      
      if (response.success) {
        toast.success("Cập nhật trạng thái thành công");
        fetchOrders(Object.fromEntries([...params]));
      } else {
        toast.error("Cập nhật trạng thái thất bại");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    }
  };
  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setValue("q", searchTerm);

    if (!searchTerm.trim()) {
      setFilteredOrders(null);
      return;
    }

    const filtered = orders?.filter((order) => {
      return order.products?.some((product) => {
        const productTitle = product.title?.toLowerCase() || '';
        return productTitle.includes(searchTerm);
      });
    });

    console.log('Search term:', searchTerm);
    console.log('Filtered orders:', filtered);
    setFilteredOrders(filtered);
  };
  const renderOrderStatus = (order) => {
    if (editOrder?._id === order._id) {
      return (
        <div className="min-w-[150px]">
          <CustomSelect
            options={[
              { value: "Pending", label: "Pending" },
              { value: "Succeed", label: "Succeed" },
              { value: "Cancelled", label: "Cancelled" }
            ]}
            value={{ value: watch("status") || order.status, label: watch("status") || order.status }}
            onChange={(option) => {
              if (option) {
                setValue("status", option.value)
              }
            }}
            placeholder="Select status"
            isSearchable={false}
            isClearable={false}
            styles={{
              clearIndicator: () => ({
                display: 'none'
              })
            }}
          />
        </div>
      );
    }
    if (order.status === 'Request Cancel') {
      return (
        <div className="flex flex-col items-center">
          <span className="text-yellow-500 mb-2">Yêu cầu hủy đơn hàng</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleCancelRequest(order._id, 'approve')}
              className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-700 text-sm"
            >
              Chấp nhận
            </button>
            <button
              onClick={() => handleCancelRequest(order._id, 'reject')}
              className="px-2 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-700 text-sm"
            >
              Từ chối
            </button>
          </div>
        </div>
      );
    }
    return <span>{order.status}</span>;
  };
  return (
    <div className="w-full flex flex-col gap-4 bg-gray-50 relative">
      <div className="h-[69px] w-full"></div>
      <div className="p-4 border-b w-full bg-gray-50 flex items-center fixed top-0">
        <h1 className="text-3xl font-bold tracking-tight">Manage orders</h1>
        {editOrder && (
          <>
            <Button
              handleOnClick={handleUpdate}
              style="bg-blue-500 text-white px-4 py-2 rounded-md mx-6"
            >
              Update
            </Button>
            <Button 
              handleOnClick={() => setEditOrder(null)}
              style="bg-gray-500 text-white px-4 py-2 rounded-md"
            >
              Cancel
            </Button>
          </>
        )}
      </div>
      <div className="px-4 flex items-center gap-4 mt-4">
        <div className="flex-1">
          <InputForm
            id="q"
            register={register}
            errors={errors}
            fullWidth
            placeholder="Search order by products..."
            onChange={handleSearch}
          />
        </div>
        <div className="min-w-[200px]">
          <CustomSelect
            options={statusOptions}
            value={statusOptions.find(option => option.value === statusFilter)}
            onChange={(option) => {
              setStatusFilter(option.value);
              const searchParams = new URLSearchParams(params);
              if (option.value === 'all') {
                searchParams.delete('status');
              } else {
                searchParams.set('status', option.value);
              }
              navigate({
                pathname: location.pathname,
                search: searchParams.toString()
              });
            }}
            placeholder="Filter by status"
            isClearable={false}
          />
        </div>
      </div>
      <div className="px-4 mt-6 w-full">
        <table className="table-auto w-full px-4">
          <thead>
            <tr className="border bg-sky-900 text-white border-white">
              <th className="text-center py-2">#</th>
              <th className="text-center py-2">Ordered By</th>
              <th className="text-center py-2">Products</th>
              <th className="text-center py-2">Total</th>
              <th className="text-center py-2">Status</th>
              <th className="text-center py-2">Ordered Date</th>
              <th className="text-center py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(filteredOrders || orders)?.map((el, idx) => (
              <tr className="border-b" key={el._id}>
                <td className="text-center py-2">
                  {(+params.get("page") > 1 ? +params.get("page") - 1 : 0) *
                    process.env.REACT_APP_LIMIT +
                    idx +
                    1}
                </td>
                <td className="text-center py-2">
                  {el.orderBy?.firstname + " " + el.orderBy?.lastname}
                </td>
                <td className="text-center py-2">
                  <span className="max-w-[350px] flex flex-col gap-2">
                    {el.products?.map((n) => (
                      <span
                        key={n._id}
                        className="w-full border-b flex items-center gap-2"
                      >
                        <img
                          src={n.thumbnail}
                          alt=""
                          className="w-12 h-12 object-cover border"
                        />
                        <span className="flex text-xs flex-col items-start gap-1">
                          <h3 className="font-semibold text-red-500">
                            {n.title}
                          </h3>
                          <span>{n.color}</span>
                          <span>{formatMoney(n.price)}</span>
                          <span>{n.quantity + " items"}</span>
                        </span>
                      </span>
                    ))}
                  </span>
                </td>
                <td className="text-center py-2">
                  {formatMoney(el.total * 23500) + " VND"}
                </td>
                <td className="text-center py-2">
                  {renderOrderStatus(el)}
                </td>
                <td className="text-center py-2">
                  {moment(el.createdAt).format("DD/MM/YYYY")}
                </td>
                <td className="text-center py-2">
                  <span
                    onClick={() => {
                      setEditOrder(el);
                      setValue("status", el.status);
                    }}
                    className="text-blue-500 hover:text-orange-500 inline-block hover:underline cursor-pointer px-1"
                  >
                    <BiEdit size={20} />
                  </span>
                  <span
                    onClick={() => handleDeleteProduct(el._id)}
                    className="text-blue-500 hover:text-orange-500 inline-block hover:underline cursor-pointer px-1"
                  >
                    <RiDeleteBin6Line size={20} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="w-full flex px-4 justify-end my-8">
        <Pagination totalCount={counts} />
      </div>
    </div>
  )
}

export default ManageOrder

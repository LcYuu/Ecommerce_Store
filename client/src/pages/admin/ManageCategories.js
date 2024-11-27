import { apiGetAllCategories } from "apis";
import { InputForm, Pagination } from "components";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import moment from "moment";
import { BiEdit } from "react-icons/bi";
import { RiDeleteBin6Line } from "react-icons/ri";

const ManageCategories = () => {
  const {
    register,
    formState: { errors },
    watch,
  } = useForm();
  const [categories, setCategories] = useState(null);
  const [counts, setCounts] = useState(0);
  const [params] = useSearchParams();
  const navigate = useNavigate()
  const location = useLocation()
  const [editCategory, setEditCategory] = useState(null)
  const [update, setUpdate] = useState(false)

  const render = useCallback(() => {
    setUpdate(!update)
  })

  const fetchCategories = async (params) => {
    const response = await apiGetAllCategories({
      ...params,
      limit: process.env.REACT_APP_LIMIT,
    });
    if (response.success) {
      setCounts(response.counts);
      setCategories(response.productCategories);
    }
  };

  useEffect(() => {
    const searchParams = Object.fromEntries([...params]);
    fetchCategories(searchParams);
  }, [params]);

  return (
    <div className="w-full flex flex-col gap-4 relative">
      {editCategory && (
        <div className="absolute inset-0 min-h-screen bg-gray-100 z-50">
          {/* <UpdateProduct
            editCategory={editCategory}
            render={render}
            setEditCategory={setEditCategory}
          /> */}
        </div>
      )}
      <div className="h-[69px] w-full"></div>
      <div className="p-4 border-b w-full bg-gray-100 flex justify-between items-center fixed top-0">
        <h1 className="text-3xl font-bold tracking-tight">Manage categories</h1>
      </div>
      <div className="flex justify-end items-center px-4">
        <form className="w-[45%]">
          <InputForm
            id="q"
            register={register}
            errors={errors}
            fullWidth
            placeholder="Search categories by title"
          />
        </form>
      </div>
      <table className="table-auto">
        <thead>
          <tr className="border bg-sky-900 text-white border-white">
            <th className="text-center py-2">Order</th>
            <th className="text-center py-2">Image</th>
            <th className="text-center py-2">Title</th>
            <th className="text-center py-2">updatedAt</th>
            <th className="text-center py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories?.map((el, idx) => (
            <tr className="border-b" key={el._id}>
              <td className="text-center py-2">
                {(+params.get("page") > 1 ? +params.get("page") - 1 : 0) *
                  process.env.REACT_APP_LIMIT +
                  idx +
                  1}
              </td>
              <td className="text-center py-2">
                <img
                  src={el.image}
                  alt="imageCategory"
                  className="w-12 h-12 object-cover"
                />
              </td>
              <td className="text-center py-2">{el.title}</td>
              <td className="text-center py-2">
                {moment(el.updatedAt).format("DD/MM/YYYY")}
              </td>
              <td className="text-center py-2">
                <span
                  onClick={() => setEditCategory(el)}
                  className="text-blue-500 hover:text-orange-500 inline-block hover:underline cursor-pointer px-1"
                >
                  <BiEdit size={20} />
                </span>
                <span
                  //onClick={() => handleDeleteProduct(el._id)}
                  className="text-blue-500 hover:text-orange-500 inline-block hover:underline cursor-pointer px-1"
                >
                  <RiDeleteBin6Line size={20} />
                </span>
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

export default ManageCategories;

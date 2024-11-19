import React, { useCallback, useState, useEffect } from "react";
import { InputForm, Button, MarkdownEditor, Loading } from "components";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { validate, getBase64 } from "ultils/helpers";
import { toast } from "react-toastify";
import { showModal } from "store/app/appSlice";
import { apiCreateCategory } from "apis";

const CreateCategory = () => {
  const dispatch = useDispatch();
  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
    watch,
  } = useForm();

  const [payload, setPayload] = useState({
    description: "",
  });
  const [preview, setPreview] = useState({
    image: null,
  });
  const [invalidFields, setInvalidFields] = useState([]);
  const changeValue = useCallback(
    (e) => {
      setPayload(e);
    },
    [payload]
  );
  const handlePreviewImage = async (file) => {
    const base64Image = await getBase64(file);
    setPreview((prev) => ({ ...prev, image: base64Image }));
  };
  useEffect(() => {
    handlePreviewImage(watch("image")[0]);
  }, [watch("image")]);

  //   const handleCreateCategory = async (data) => {
  //     const invalids = validate(payload, setInvalidFields);
  //     if (invalids === 0) {
  //       if (data.category)
  //         data.category = categories?.find(
  //           (el) => el._id === data.category
  //         )?.title;
  //       const finalPayload = { ...data, ...payload };
  //       const formData = new FormData();
  //       for (let i of Object.entries(finalPayload)) formData.append(i[0], i[1]);
  //       if (finalPayload.image) formData.append("image", finalPayload.image[0]);
  //       dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));
  //       const response = await apiCreateCategory(formData);
  //       dispatch(showModal({ isShowModal: false, modalChildren: null }));
  //       if (response.success) {
  //         toast.success(response.mes);
  //         reset();
  //         setPayload({
  //           image: "",
  //         });
  //       } else toast.error(response.mes);
  //     }
  //   };

  //test nè
  const handleCreateCategory = async (data) => {
    const invalids = validate(payload, setInvalidFields);
    if (invalids === 0) {
      const finalPayload = { ...data, ...payload };
      const formData = new FormData();
      for (let [key, value] of Object.entries(finalPayload)) {
        if (key === "brand" && typeof value === "string") {
          const brandsArray = value.split(",").map((item) => item.trim());
          brandsArray.forEach((brand) => {
            formData.append("brand", brand);
          });
        } else {
          formData.append(key, value);
        }
      }
      if (finalPayload.image) formData.append("image", finalPayload.image[0]);

      dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));
      const response = await apiCreateCategory(formData);
      dispatch(showModal({ isShowModal: false, modalChildren: null }));

      if (response.success) {
        toast.success(response.mes);
        reset();
        setPayload({ description: "" });
        setPreview({ image: null });
      } else {
        toast.error(response.mes);
      }
    }
  };

  return (
    <div className="w-full">
      <h1 className="h-[75px] flex justify-between items-center text-3xl font-bold px-4 border-b">
        <span>Create New Category</span>
      </h1>
      <div className="p-4">
        <form onSubmit={handleSubmit(handleCreateCategory)}>
          <InputForm
            label="Name category"
            register={register}
            errors={errors}
            id="title"
            validate={{
              required: "Need fill this field",
            }}
            fullWidth
            placeholder="Name of new category"
          />
          <InputForm
            label="Brands"
            register={register}
            errors={errors}
            id="brand"
            validate={{
              required: "Need fill this field",
            }}
            fullWidth
            placeholder="Each brand is separated by a comma"
          />
          <MarkdownEditor
            name="description"
            changeValue={changeValue}
            label="Description"
            invalidFields={invalidFields}
            setInvalidFields={setInvalidFields}
          />
          <div className="flex flex-col gap-2 mt-8">
            <label className="font-semibold" htmlFor="image">
              Upload image
            </label>
            <input
              type="file"
              id="image"
              {...register("image", { required: "Need fill" })}
            />
            {errors["image"] && (
              <small className="text-xs text-red-500">
                {errors["image"]?.message}
              </small>
            )}
          </div>
          {preview.image && (
            <div className="my-4">
              <img
                src={preview.image}
                alt="imageCategory"
                className="w-[200px] object-contain"
              />
            </div>
          )}
          <div className="my-6">
            <Button type="submit">Create new category</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCategory;

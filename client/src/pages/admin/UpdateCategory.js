import { apiUpdateCategory } from "apis";
import { Button, InputForm, Loading, MarkdownEditor } from "components";
import { memo, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { showModal } from "store/app/appSlice";
import { getBase64, validate } from "ultils/helpers";

const UpdateCategory = ({ editCategory, render, setEditCategory }) => {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
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
    reset({
      title: editCategory?.title || "",
      brand: editCategory?.brand || "",
    });
    setPayload({
      description:
        typeof editCategory?.description === "object"
          ? editCategory?.description?.join(", ")
          : editCategory?.description,
    });
    setPreview({
      image: editCategory?.image || "",
    });
  }, [editCategory]);

  useEffect(() => {
    if (watch("image") instanceof FileList && watch("image").length > 0)
      handlePreviewImage(watch("image")[0]);
  }, [watch("image")]);

  const handleUpdateCategory = async (data) => {
    const invalids = validate(payload, setInvalidFields);
    if (invalids === 0) {
      const finalPayload = { ...data, ...payload };
      const formData = new FormData();
      finalPayload.image = data?.image?.length === 0 ? preview.image : data.image[0]
      for (let [key, value] of Object.entries(finalPayload)) {
        if (key === "brand" && typeof value === "string") {
          const brandsArray = value.split(",").map((item) => item.trim());
          brandsArray.forEach((brand) => {
            formData.append("brand", brand);
          });
        } 
        else {
          formData.append(key, value);
        }
      }

      dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));
      const response = await apiUpdateCategory(formData, editCategory._id);
      dispatch(showModal({ isShowModal: false, modalChildren: null }));

      if (response.success) {
        toast.success(response.mes);
        render();
        setEditCategory(null);
      } else {
        toast.error(response.mes);
      }
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 relative">
      <div className="h-[69px] w-full"></div>
      <div className="p-4 border-b bg-gray-100 flex justify-between items-center right-0 left-[327px] fixed top-0">
        <h1 className="text-3xl font-bold tracking-tight">Update category</h1>
        <span
          className="text-main hover:underline cursor-pointer"
          onClick={() => setEditCategory(null)}
        >
          Cancel
        </span>
      </div>
      <div className="p-4">
        <form onSubmit={handleSubmit(handleUpdateCategory)}>
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
            value={payload.description}
          />
          <div className="flex flex-col gap-2 mt-8">
            <label className="font-semibold" htmlFor="image">
              Upload image
            </label>
            <input type="file" id="image" {...register("image")} />
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
            <Button type="submit">Update category</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default memo(UpdateCategory);

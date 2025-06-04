import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import axios from "axios";
import { MdClose } from "react-icons/md";
import TextInput from "./TextInput";
import CustomButton from "./CustomButton";
import Loading from "./Loading";
import { CreateFamily } from "../redux/userSlice";
import { URL_BACKEND } from "../utils/url_back";

const CreateFamilyTree = () => {
  const dispatch = useDispatch();
  const [errMsg, setErrMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      lastName: "",
      description: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setErrMsg("");

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const payload = {
        lastName: data.lastName,
        description: data.description,
      };

      const response = await axios.post(
        `${URL_BACKEND}/api/FamilyTrees`,
          payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data);

      if (response.status === 201) {
        setErrMsg({ status: "success", message: "Family tree created successfully" });
        setTimeout(() => {
          setErrMsg("");
          dispatch(CreateFamily(false)); // Fermer le modal
          reset(); // Réinitialiser les champs
        }, 3000);
      } else {
        throw new Error(response.data?. message || "Failed to create family tree");
      }
    } catch (error) {
      console.error("Error creating family tree:", error);
      setErrMsg({
        status: "failed",
        message: error.response?.data?.message || error.message || "Failed to create family tree",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    dispatch(CreateFamily(false));
    reset();
  };

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-[#000] opacity-70"></div>
        </div>
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          ​
        </span>
        <div
          className="inline-block align-bottom bg-primary rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          <div className="flex justify-between px-6 pt-5 pb-2">
            <label
              htmlFor="modal-headline"
              className="block font-medium text-xl text-ascent-1 text-left"
            >
              Create Family Tree
            </label>
            <button
              className="text-ascent-1"
              onClick={handleClose}
              aria-label="Close create family tree modal"
            >
              <MdClose size={22} />
            </button>
          </div>
          <form
            className="px-4 sm:px-6 flex flex-col gap-3 2xl:gap-6"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <TextInput
              name="lastName" // Changé de LastName à name
              label="Tree Name"
              placeholder="Enter family tree name"
              type="text"
              styles="w-full"
              register={register("lastName", {
                required: "Last name is required!",
              })}
              error={errors.lastName ? errors.lastName.message : ""}
            />
            <TextInput
              name="description"
              label="Description"
              placeholder="Enter description"
              type="textarea"
              styles="w-full"
              register={register("description", {
                required: "Description is required!",
              })}
              error={errors.description ? errors.description.message : ""}
            />

            {errMsg?.message && (
              <span
                role="alert"
                className={`text-sm ${
                  errMsg.status === "failed"
                    ? "text-[#f64949fe]"
                    : "text-[#2ba150fe]"
                } mt-0.5`}
              >
                {errMsg.message}
              </span>
            )}

            <div className="py-5 sm:flex sm:flex-row-reverse border-t border-[#66666645]">
              {isSubmitting ? (
                <Loading />
              ) : (
                <CustomButton
                  type="submit"
                  containerStyles="inline-flex justify-center rounded-md bg-blue px-8 py-3 text-sm font-medium text-white outline-none"
                  title="Submit"
                  aria-label="Submit family tree creation"
                />
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateFamilyTree;
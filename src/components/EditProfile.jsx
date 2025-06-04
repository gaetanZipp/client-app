import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { MdClose } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import TextInput from "./TextInput";
import Loading from "./Loading";
import CustomButton from "./CustomButton";
import { updateProfile } from "../redux/userSlice";
import axios from "axios";
import { URL_BACKEND } from "../utils/url_back";

const EditProfile = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [errMsg, setErrMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [picture, setPicture] = useState(null); // Stocke la chaîne Base64

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      profession: user?.profession || "",
      location: user?.location || "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setErrMsg("");

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      // Préparer les données à envoyer
      const payload = {
        FirstName: data.firstName,
        LastName: data.lastName,
        Profession: data.profession,
        Location: data.location,
        ProfileUrl: picture || undefined, // Envoyer la chaîne Base64 ou undefined si pas d'image
      };

      // Envoyer la requête PUT à l'API
      const response = await axios.put(
        `${URL_BACKEND}/api/Users/update`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response data:", response.data.user.profileUrl); // Pour déboguer

      if (response.data?.success) {
        // Mettre à jour le Redux store avec les nouvelles données utilisateur
        dispatch(
          updateProfile({
            user: response.data.User,
            token: response.data.Token,
            isOpen: false, // Fermer le modal
          })
        );
        setErrMsg({ status: "success", message: "Profile updated successfully" });
        setTimeout(() => {
          setErrMsg("");
          handleClose(); // Fermer le modal après le message de succès
        }, 3000);
      } else {
        throw new Error(response.data?.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrMsg({
        status: "failed",
        message: error.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    dispatch(updateProfile(false));
  };

  const handleSelect = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setErrMsg({
        status: "failed",
        message: "No file selected",
      });
      return;
    }
    // Vérifier le type et la taille (max 5MB)
    if (
      file &&
      ["image/jpeg", "image/png", "image/jpg"].includes(file.type) &&
      file.size <= 5 * 1024 * 1024
    ) {
      const reader = new FileReader();
      reader.onload = () => {
        setPicture(reader.result); // Stocke la chaîne Base64
        setErrMsg(""); // Réinitialiser les erreurs
      };
      reader.onerror = () => {
        setPicture(null);
        setErrMsg({
          status: "failed",
          message: "Failed to read the image file",
        });
      };
      reader.readAsDataURL(file); // Convertir en Base64
    } else {
      setPicture(null);
      setErrMsg({
        status: "failed",
        message:
          "Please select a valid image file (jpg, png, jpeg) with size less than 5MB",
      });
    }
  };

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
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
              Edit Profile
            </label>
            <button
              className="text-ascent-1"
              onClick={handleClose}
              aria-label="Close edit profile modal"
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
              name="firstName"
              label="First Name"
              placeholder="First Name"
              type="text"
              styles="w-full"
              register={register("firstName", {
                required: "First Name is required!",
              })}
              error={errors.firstName ? errors.firstName.message : ""}
            />

            <TextInput
              name="lastName"
              label="Last Name"
              placeholder="Last Name"
              type="text"
              styles="w-full"
              register={register("lastName", {
                required: "Last Name is required!",
              })}
              error={errors.lastName ? errors.lastName.message : ""}
            />

            <TextInput
              name="profession"
              label="Profession"
              placeholder="Profession"
              type="text"
              styles="w-full"
              register={register("profession", {
                required: "Profession is required!",
              })}
              error={errors.profession ? errors.profession.message : ""}
            />

            <TextInput
              name="location"
              label="Location"
              placeholder="Location"
              type="text"
              styles="w-full"
              register={register("location", {
                required: "Location is required!",
              })}
              error={errors.location ? errors.location.message : ""}
            />

            <label
              className="flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer my-4"
              htmlFor="imgUpload"
            >
              {/* <span>Profile Picture</span> */}
              <input
                type="file"
                className=""
                id="imgUpload"
                onChange={handleSelect}
                accept=".jpg,.png,.jpeg"
                aria-label="Upload profile picture"
              />
              {/* <input
                  type='file'
                  className=''
                  id='imgUpload'
                  onChange={(e) => handleSelect(e)}
                  accept='.jpg, .png, .jpeg'
                /> */}
            </label>

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
                  aria-label="Submit profile changes"
                />
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
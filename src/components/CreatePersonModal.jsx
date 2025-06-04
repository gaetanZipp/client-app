import React, { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import TextInput from './TextInput';
import { URL_BACKEND } from '../utils/url_back';
import { CreatePerson } from '../redux/userSlice';

const CreatePersonModal = () => {
    const { user } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const [errMsg, setErrMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [persons, setPersons] = useState([]);
    const familyTreeId = localStorage.getItem("familyTreeId");

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm({
        mode: "onChange",
        defaultValues: {
            name: "",
            gender: "",
            birthDate: "",
            deathDate: "",
            fid: null,
            mid: null,
            fidName: "",
            midName: "",
        },
    });

    useEffect(() => {
        const fetchPersons = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${URL_BACKEND}/api/Persons`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setPersons(response.data);
            } catch (error) {
                console.error("Error fetching persons:", error);
            }
        };

        fetchPersons();
    }, []);

    const filteredPersons = persons.filter(p => p.id !== user?.id);

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);
            setErrMsg("");

            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found");

            const payload = {
                Name: data.name,
                Gender: data.gender,
                BirthDate: data.birthDate || null,
                DeathDate: data.deathDate || null,
                Fid: data.fid || null,
                Mid: data.mid || null,
                FamilyTreeId: familyTreeId
            };

            const response = await axios.post(
                `${URL_BACKEND}/api/Persons`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data?.success) {
                setErrMsg({ status: "success", message: "Person created successfully" });
                setTimeout(() => {
                    setErrMsg("");
                    dispatch(CreatePerson(false)); // Ferme le modal
                    reset();
                    window.location.reload(); // Rafraîchit la page
                }, 3000);
            } else {
                throw new Error(response.data?.message || "Failed to create person");               
            }
        } catch (error) {
            setErrMsg({
                status: "failed",
                message: error.response?.data?.message || error.message,
            });
            window.location.reload();
        } finally {
            setIsSubmitting(false);
            window.location.reload();
        }
    };

    const handleClose = () => {
        dispatch(CreatePerson(false)); // Utilise l'action du userSlice
        reset();
    };

    const handleFatherSelect = (e) => {
        const selectedPerson = persons.find(p => p.name === e.target.value);
        if (selectedPerson) {
            setValue("fid", selectedPerson.id);
            setValue("fidName", selectedPerson.name);
        }
    };

    const handleMotherSelect = (e) => {
        const selectedPerson = persons.find(p => p.name === e.target.value);
        if (selectedPerson) {
            setValue("mid", selectedPerson.id);
            setValue("midName", selectedPerson.name);
        }
    };

    return (
        <div className='fixed z-50 inset-0 overflow-y-auto'>
            <div className='flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0'>
                <div className='fixed inset-0 transition-opacity' aria-hidden='true'>
                    <div className='absolute inset-0 bg-[#000] opacity-70'></div>
                </div>
                <span 
                    className='hidden sm:inline-block sm:align-middle sm:h-screen'
                    aria-hidden='true'    
                >
                    ​
                </span>
                <div
                    className='inline-block align-bottom bg-primary rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full'
                    role='dialog'
                    aria-modal='true'
                    aria-labelledby='modal-headline'
                >
                    <div className='flex justify-between px-6 pt-5 pb-2'>
                        <label 
                            htmlFor='modal-headline'
                            className='block font-medium text-xl text-ascent-1 text-left'
                        >
                            Create Family Member
                        </label>
                        <button
                            className='text-ascent-1'
                            onClick={handleClose}
                            aria-label='Close create person modal'
                        >
                            <MdClose size={22} />
                        </button>
                    </div>
                    <form
                        className='px-4 sm:px-6 flex flex-col gap-3 2xl:gap-6 py-4'
                        onSubmit={handleSubmit(onSubmit)}
                        noValidate
                    >
                        {errMsg?.message && (
                            <div className={`text-sm ${errMsg.status === "success" ? "text-green-500" : "text-red-500"}`}>
                                {errMsg.message}
                            </div>
                        )}

                        <TextInput 
                            name='name'
                            label='Full Name'
                            placeholder='Enter full name'
                            type='text'
                            styles='w-full'
                            register={register("name", {
                                required: 'Name is required!',
                            })}
                            error={errors.name ? errors.name.message : ""}
                        />

                        <div className='flex flex-col gap-2'>
                            <label className='text-ascent-2 text-sm'>Gender</label>
                            <select
                                {...register("gender", { required: 'Gender is required!' })}
                                className='w-full p-2 bg-secondary rounded border border-[#66666690] outline-none text-ascent-1'
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                            {errors.gender && (
                                <span className='text-xs text-[#f64949fe]'>{errors.gender.message}</span>
                            )}
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div className='flex flex-col gap-2'>
                                <label className='text-ascent-2 text-sm'>Birth Date</label>
                                <input
                                    type='date'
                                    {...register("birthDate")}
                                    className='w-full p-2 bg-secondary rounded border border-[#66666690] outline-none text-ascent-1'
                                />
                            </div>
                            <div className='flex flex-col gap-2'>
                                <label className='text-ascent-2 text-sm'>Death Date (if applicable)</label>
                                <input
                                    type='date'
                                    {...register("deathDate")}
                                    className='w-full p-2 bg-secondary rounded border border-[#66666690] outline-none text-ascent-1'
                                />
                            </div>
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div className='flex flex-col gap-2'>
                                <label className='text-ascent-2 text-sm'>Father</label>
                                <select
                                    {...register("fidName")}
                                    onChange={handleFatherSelect}
                                    className='w-full p-2 bg-secondary rounded border border-[#66666690] outline-none text-ascent-1'
                                >
                                    <option value="">Select Father</option>
                                    {filteredPersons
                                        .filter(person => person.gender === "male")
                                        .map(person => (
                                            <option key={person.id} value={person.name}>
                                                {person.name}
                                            </option>
                                        ))}
                                </select>
                                <input type="hidden" {...register("fid")} />
                            </div>
                            <div className='flex flex-col gap-2'>
                                <label className='text-ascent-2 text-sm'>Mother</label>
                                <select
                                    {...register("midName")}
                                    onChange={handleMotherSelect}
                                    className='w-full p-2 bg-secondary rounded border border-[#66666690] outline-none text-ascent-1'
                                >
                                    <option value="">Select Mother</option>
                                    {filteredPersons
                                        .filter(person => person.gender === "female")
                                        .map(person => (
                                            <option key={person.id} value={person.name}>
                                                {person.name}
                                            </option>
                                        ))}
                                </select>
                                <input type="hidden" {...register("mid")} />
                            </div>
                        </div>

                        <div className='flex justify-end gap-3 pt-4 pb-6'>
                            <button
                                type='button'
                                onClick={handleClose}
                                className='px-4 py-2 text-sm text-ascent-1 border border-[#666] bg-transparent rounded-md'
                            >
                                Cancel
                            </button>
                            <button
                                type='submit'
                                disabled={isSubmitting}
                                className='px-4 py-2 text-sm text-white bg-blue rounded-md hover:bg-blue-600 disabled:bg-blue-300'
                            >
                                {isSubmitting ? "Creating..." : "Create"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreatePersonModal;
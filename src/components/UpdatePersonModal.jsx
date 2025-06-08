import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux'
import { URL_BACKEND } from '../utils/url_back';
import { UpdatePerson } from '../redux/userSlice';
import { MdClose } from 'react-icons/md';
import TextInput from './TextInput';

const UpdatePersonModal = () => {
    const { user } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const [errMsg, setErrMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingPersons, setLoadingPersons] = useState(false);
    const [personData, setPersonData] = useState(null);
    const [persons, setPersons] = useState([]);
    
    const familyTreeId = localStorage.getItem("familyTreeId");
    const personId = localStorage.getItem("personId");
    
    const { updatePerson } = useSelector((state) => state.user);
    if (!updatePerson) return null;

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
                const response = await axios.get(`${URL_BACKEND}/api/Persons/familytree/${familyTreeId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setPersons(response.data);
            } catch (error) {
                console.error("Error fetching persons:", error);
            }
        };

        if (familyTreeId) fetchPersons();
    }, [familyTreeId]);

    useEffect(() => {
        const fetchPerson = async () => {
            if(!familyTreeId || !personId) {
                setErrMsg({status: "failed", message: "Family Tree ID or Person ID is missing."});
                return;
            }

            setLoadingPersons(true);
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("No authentication token found");

                const personResponse = await axios.get(`${URL_BACKEND}/api/Persons/${personId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const person = personResponse.data;
                setPersonData(person);

                // ✅ Correction : Pré-remplir TOUS les champs
                setValue("name", person.name || "");
                setValue("gender", person.gender || "");
                
                // ✅ Correction : Gérer les dates correctement
                if (person.birthDate) {
                    setValue("birthDate", new Date(person.birthDate).toISOString().split('T')[0]);
                }
                if (person.deathDate) {
                    setValue("deathDate", new Date(person.deathDate).toISOString().split('T')[0]);
                }
                
                // ✅ Correction : Pré-remplir les parents
                if (person.fid) {
                    setValue("fid", person.fid.toString());
                    // Trouver le nom du père
                    const father = persons.find(p => p.id === person.fid);
                    if (father) setValue("fidName", father.name);
                }
                
                if (person.mid) {
                    setValue("mid", person.mid.toString());
                    // Trouver le nom de la mère
                    const mother = persons.find(p => p.id === person.mid);
                    if (mother) setValue("midName", mother.name);
                }
                
            } catch (error) {
                setErrMsg({status: "failed", message: error.message || "Failed to fetch person data."});
                console.log("Error: ",error);
            } finally {
                setLoadingPersons(false);
            }
        };

        if (personId && persons.length > 0) {
            fetchPerson();
        }

    }, [familyTreeId, personId, setValue, persons]);

    const filteredPersons = persons.filter(p => p.id.toString() !== personId);

    const onSubmit = async (data) => {
        console.log("Submitting:", data);

        try {
            setIsSubmitting(true);
            setErrMsg('');

            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found");
            if (!familyTreeId) throw new Error("Family Tree ID is missing");

            const payload = {
                name: data.name,
                gender: data.gender,
                birthDate: data.birthDate || null,
                deathDate: data.deathDate || null,
                fid: data.fid ? parseInt(data.fid) : null,
                mid: data.mid ? parseInt(data.mid) : null,
                familyTreeId: parseInt(familyTreeId),
				id: parseInt(personId),
            };

            console.log('Payload:', JSON.stringify(payload, null, 2));

            const response = await axios.put(
                `${URL_BACKEND}/api/Persons/${personId}`, 
                payload, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            console.log("Response:", response.data);

            // ✅ Correction : Gestion du succès améliorée
            setErrMsg({ status: 'success', message: 'Person Updated Successfully' });
            
            setTimeout(() => {
                setErrMsg('');
                dispatch(UpdatePerson(false));
                reset();
                window.location.reload(); // Un seul reload à la fin
            }, 1500);

        } catch (error) {
            console.error("Error updating person:", error);
            setErrMsg({
                status: 'failed', 
                message: error.response?.data?.message || 'Failed to update person' 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        dispatch(UpdatePerson(false));
        reset();
    };

    const handleFatherSelect = (e) => {
        const selectedPerson = persons.find(p => p.name === e.target.value);
        if (selectedPerson) {
            setValue("fid", selectedPerson.id);
            setValue("fidName", selectedPerson.name);
        } else {
            setValue("fid", "");
            setValue("fidName", "");
        }
    }

    const handleMotherSelect = (e) => {
        const selectedPerson = persons.find(p => p.name === e.target.value);
        if (selectedPerson) {
            setValue("mid", selectedPerson.id);
            setValue("midName", selectedPerson.name);
        } else {
            setValue("mid", "");
            setValue("midName", "");
        }
    }

    if (loadingPersons) {
        return (
            <div className='fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-50'>
                <div className='bg-primary p-6 rounded-lg'>
                    <p className='text-ascent-1'>Loading person data...</p>
                </div>
            </div>
        );
    }

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
                            Update Family Member
                        </label>
                        <button
                            className='text-ascent-1'
                            onClick={handleClose}
                            aria-label='Close update person modal'
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
                                {isSubmitting ? "Updating..." : "Update"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default UpdatePersonModal
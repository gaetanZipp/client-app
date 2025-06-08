import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { URL_BACKEND } from '../utils/url_back';
import { AddPartner } from '../redux/userSlice';
import { MdClose } from 'react-icons/md';

const AddPartnerModal = () => {
    const { user } = useSelector((state) => state.user);
    const { addPartner } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const [errMsg, setErrMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingPersons, setLoadingPersons] = useState(false);
    const [persons, setPersons] = useState([]);
    const [selectedPerson, setSelectedPerson] = useState(null);

    const personId = localStorage.getItem("personId");
    const familyTreeId = localStorage.getItem("familyTreeId");

    const { register, handleSubmit, reset, setValue } = useForm({
        mode: "onChange",
        defaultValues: {
            partnerId: "",
            partnerName: ""
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoadingPersons(true);
                const token = localStorage.getItem("token");
                
                // Fetch current person
                const personResponse = await axios.get(`${URL_BACKEND}/api/Persons/${personId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSelectedPerson(personResponse.data);

                // Fetch all persons
                const personsResponse = await axios.get(`${URL_BACKEND}/api/Persons/familytree/${familyTreeId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPersons(personsResponse.data);

            } catch (error) {
                console.error("Error:", error);
                setErrMsg("Failed to load data");
            } finally {
                setLoadingPersons(false);
            }
        };

        if (familyTreeId && personId) fetchData();
    }, [familyTreeId, personId]);

    const filteredPersons = persons.filter((person) => person.id !== personId);

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);
            const token = localStorage.getItem("token");
            const partnerId = localStorage.getItem("partnerId");
            
            const response = await axios.post(
                `${URL_BACKEND}/api/Persons/${personId}/AddPartner/${partnerId}`,
                {
                    partnerId: parseInt(data.partnerId),
                    familyTreeId: parseInt(familyTreeId)
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log("response: ", response.data);

            setErrMsg({ status: 'success', message: 'Partner added successfully' });
            setTimeout(() => {
                dispatch(AddPartner(false));
                reset();
            }, 1500);
        } catch (error) {
            console.error("Error:", error.response?.data || error.message);
            setErrMsg({
                status: 'error',
                message: error.response?.data?.message || 'Failed to add partner'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePartner = (e) => {
        const selectedId = e.target.value;
        localStorage.setItem("partnerId", selectedId)
        const partner = persons.find(p => p.id.toString() === selectedId);
        if (partner) {
            setValue("partnerId", partner.id);
            setValue("partnerName", partner.name);
        }
    };

    const handleClose = () => {
        dispatch(AddPartner(false));
        reset();
    };

    if (!addPartner) return null;

    if (loadingPersons) {
        return (
            <div className='fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-50'>
                <div className='bg-primary p-6 rounded-lg'>
                    <p className='text-ascent-1'>Loading...</p>
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
                
                <div className='inline-block align-bottom bg-primary rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full'>
                    <div className='flex justify-between px-6 pt-5 pb-2'>
                        <h2 className='text-xl font-medium text-ascent-1'>Add Partner</h2>
                        <button onClick={handleClose} aria-label='Close modal'>
                            <MdClose size={22} className='text-ascent-1' />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmit(onSubmit)} className='px-4 sm:px-6 py-4'>
                        {errMsg?.message && (
                            <div className={`mb-4 text-sm ${
                                errMsg.status === 'success' ? 'text-green-500' : 'text-red-500'
                            }`}>
                                {errMsg.message}
                            </div>
                        )}

                        <div className='mb-4'>
                            <p className='text-ascent-2 mb-2'>
                                Select partner for {selectedPerson?.name || "this person"}
                            </p>
                            <select
                                {...register("partnerId")}
                                onChange={handlePartner}
                                className='w-full p-2 bg-secondary rounded border border-[#66666690] outline-none text-ascent-1'
                                required
                            >
                                <option value="">Select Partner</option>
                                {filteredPersons.map(person => (
                                    <option key={person.id} value={person.id}>
                                        {person.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className='flex justify-end gap-3 pt-4'>
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
                                {isSubmitting ? "Adding..." : "Add Partner"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddPartnerModal;
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux'
import { URL_BACKEND } from '../utils/url_back';
import { UpdatePerson } from '../redux/userSlice';
import { MdClose } from 'react-icons/md';

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

				//Pre-remplir les champs du formulaire
				setValue("name", person.name);
				setValue("birthDate", person.birthDate ? new Date(person.birthDate).toISOString().split('T')[0] : "");
				setValue("deathDate", person.deathDate ? new Date(person.deathDate).toISOString().split('T')[0] : "");
				setValue("fid", person.fid?.toString() || "");
				setValue("mid", person.mid?.toString() || "");
				setValue("fidName", person.father?.name || "");
				setValue("midName", person.mother?.name || "");
			} catch (error) {
				setErrMsg({status: "failed", message: error.message || "Failed to fetch person data."});
				console.log("Error: ",error);
			} finally {
				setLoadingPersons(false);
			}
		};

		fetchPerson();

	}, [personId, familyTreeId, setValue]);

	const filteredPersons = persons.filter(p => p.id !== user?.id);

	const onSubmit = async (data) => {
		try {
			setIsSubmitting(true);
			setErrMsg('');

			const token = localStorage.getItem("token");
			if (!token) throw new Error("No authentication token found");
			if (!familyTreeId) throw new Error("Family Tree ID is missing");
			if (!personData) throw new Error("Person ID is missing");

			const payload ={
				name: personData.name,
				gender: personData.gender,
				birthDate: personData.birthDate,
				deathDate: personData.deathDate,
				fid: data.fid ? parseInt(data.fid) : null,
				mid: data.mid ? parseInt(data.mid) : null,
				familyTreeId: familyTreeId,
			};

			console.log('Payload:', JSON.stringify(payload, null, 2)); // Débogage

			await axios.put(`${URL_BACKEND}/api/Persons/${PersonId}`, payload, {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});

			setErrMsg({ status: 'success', message: 'Parents mis à jour avec succès' });
			dispatch(RefreshTree(true)); // Signaler à Person.jsx de recharger
			setTimeout(() => {
				setErrMsg('');
				dispatch(UpdateParents({ open: false, personId: null }));
				reset();
			}, 3000);
		}
		catch (error) {
			console.error("Error updating person:", error);
			setErrMsg({ status: 'failed', message: error.response?.data?.message || 'Échec de la mise à jour des parents' });
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		dispatch(UpdatePerson(false));
		reset();
	};

	handleFatherSelect = (e) => {
		const selectedPerson = persons.find(p => p.name === e.target.value);
        if (selectedPerson) {
            setValue("fid", selectedPerson.id);
            setValue("fidName", selectedPerson.name);
        }
	}

	handleMotherSelect = (e) => {
		const selectedPerson = persons.find(p => p.name === e.target.value);
        if (selectedPerson) {
            setValue("mid", selectedPerson.id);
            setValue("midName", selectedPerson.name);
        }
	}

    return (
      <div className='fixed z-50 inset-0 overflow-y-auto'>
		<div className='flex items-center justify-center min-h-screen px-4 pb-20 pt-4 text-center sm:p-0'>
			<div className='absolute inset-0 bg-[#000] opacity-70'></div>
		</div>
		<span className='hidden sm:inline-block sm:align-middle sm:h-screen' aria-hidden='true'>
			​
		</span>
		<div
			className='inline-block align-bottom bg-primary rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full '
			aria-modal='true'
			aria-labelledby='modal-headline'
		>
			<div className='flex justify-between px-6 pt-5 pb-2'>
				<label 
					htmlFor="modal-headline"
					className='block font-medium text-xl text-ascent-1 text-left'
				>
					Update Person
				</label>
				<button
					className='text-ascent-1'
					onClick={handleClose}
					aria-label='Close Update Person Modal'
				>
					<MdClose size={22} />
				</button>
				<form
					onSubmit={handleSubmit(onSubmit)}
					className='px-4 sm:px-6 flex flex-col gap-3 2xl:gap-6 py-4'
					noValidate
				>
					{errMsg?.message && (
						<div className={`text-sm ${errMsg.status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
							{errMsg.message}
						</div>
					)}
				</form>
			</div>
		</div>
      </div>
    )
}

export default UpdatePersonModal
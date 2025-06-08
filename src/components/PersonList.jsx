import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { NoProfile } from '../assets';
import { CreatePerson, UpdatePerson } from '../redux/userSlice';
import { LiaEditSolid } from 'react-icons/lia';
import { URL_BACKEND } from '../utils/url_back';
import { Link } from 'react-router-dom';
import CreatePersonModal from './CreatePersonModal';
import { LuDelete } from 'react-icons/lu';
import axios from 'axios';
import UpdatePersonModal from './UpdatePersonModal';


const PersonList = () => {
    const [persons, setPersons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const {createPerson, updatePerson} = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const familyTreeId = localStorage.getItem("familyTreeId");

    useEffect(() => {
        const fetchPersons = async () => {
            setLoading(true);
            setError(null);
            try{
                const token = localStorage.getItem("token");
                if(!token) throw new Error("No authentication token found");

                const response = await fetch(`${URL_BACKEND}/api/Persons/familytree/${familyTreeId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch person");
                }
                const data = await response.json();
                setPersons(Array.isArray(data) ? data : []);
            }
            catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        if (familyTreeId) {
            fetchPersons();
        } else {
            setError("Family Tree not found.");
        }
    }, [familyTreeId])

    const handleDelete = async (personId) => {
        if (!window.confirm('Voulez-vous vraiment supprimer cette personne ?')) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Aucun token d\'authentification trouvé');

            const response = await axios.delete(`${URL_BACKEND}/api/Persons/${personId}`, {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            });

            console.log(response.data);

            setPersons(persons.filter((p) => p.id !== personId));
            window.location.reload();
        } catch (error) {
            setError(error.response?.data?.message || 'Échec de la suppression');
            console.error('Erreur:', error);
        }
    };

    const handleEditClick = (e, personId) => {
        e.stopPropagation(); // Empêche le déclenchement du onClick du parent Link
        localStorage.setItem("personId", personId);
        dispatch(UpdatePerson(true));
    };

    return (
        <div className="w-full bg-primary shadow-sm rounded-lg flex flex-col px-6 py-4">
            <div className="flex items-center justify-between pb-2 text-ascent-1 border-b border-[#66666645]">
                <span>Members of the family</span>
                <span>
                    <LiaEditSolid
                        size={22}
                        className="text-blue cursor-pointer"
                        onClick={() => dispatch(CreatePerson(true))}
                        aria-label="Create new person"
                    />
                </span>
            </div>

            {createPerson && <CreatePersonModal />}
            {updatePerson && <UpdatePersonModal />}
            
            <div className="w-full flex flex-col gap-4 pt-4">
                {loading ? (
                    <p className="text-ascent-2">Loading...</p>
                ) : error ? (
                    <p className="text-[#f64949fe]">{error}</p>
                ) : persons.length > 0 ? (
                    persons.map((person) => (
                        <Link
                            key={person.id}
                            className="w-full flex gap-4 items-center cursor-pointer"
                            aria-label={`View family tree ${person.name || "Unknown"}`}
                            onClick={(e) => {
                                e.preventDefault(); // Empêche la navigation immédiate (optionnel)
                                localStorage.setItem("personId", person.id);
                            }}
                        >
                            <img
                                src={NoProfile}
                                alt="Family Tree"
                                className="w-10 h-10 object-cover rounded-full"
                            />
                            <div className="flex-1">
                                <p className="text-base font-medium text-ascent-1">
                                {person.name || "Unknown"}
                                </p>
                                <span className="text-sm text-ascent-2">
                                {person.birthDate || "0000-00-00"}
                                </span>
                            </div>
                            <span>
                                <LiaEditSolid
                                    size={22}
                                    className="text-blue cursor-pointer"
                                    onClick={() => dispatch(UpdatePerson(true))}
                                    aria-label="Create new person"
                                />
                            </span>
                            <span>
                                <LuDelete 
                                    className='text-[#f64949fe] cursor-pointer'
                                    size={22}
                                    aria-label='Delete Person'
                                    onClick={() => handleDelete(person.id)}
                                />
                            </span>
                        </Link>
                    ))
                ) : (
                    <p className="text-ascent-2">No people to show</p>
                )}
            </div>
        </div>
    )
}

export default PersonList
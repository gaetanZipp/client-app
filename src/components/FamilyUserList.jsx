import axios from 'axios';
import React, { useEffect, useState } from 'react'  
import { URL_BACKEND } from '../utils/url_back';
import { NoProfile } from '../assets';
import { LiaEditSolid } from 'react-icons/lia';


const FamilyUserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const familyTreeId = localStorage.getItem("familyTreeId");

  const fetchFamilyTreeUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Aucun token d\'authentification trouvé');
      if (!familyTreeId) throw new Error('Arbre généalogique non sélectionné');

      const response = await axios.get(`${URL_BACKEND}/api/FamilyUsers/familytree/${familyTreeId}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("response: ", response.data);

      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data || err.message || 'Erreur lors du chargement des utilisateurs');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilyTreeUsers();
  }, [familyTreeId]);

  return (
    <div className="w-full bg-primary shadow-sm rounded-lg flex flex-col px-6 py-4">
      <div className="flex items-center justify-between pb-2 text-ascent-1 border-b border-[#66666645]">
          <span>Users of family tree</span>
          <span>
              <LiaEditSolid
                  size={22}
                  className="text-blue cursor-pointer"
                  // onClick={() => dispatch(CreatePerson(true))}
                  aria-label="Create new person"
              />
          </span>
      </div>
      <div className="w-full flex flex-col gap-4 pt-4">
        {loading ? (
          <p className="text-ascent-2">Chargement...</p>
        ) : error ? (
          <p className="text-[#f64949fe]">{error}</p>
        ) : users.length > 0 ? (
          users.map((user) => (
            <div
              key={user.id}
              className="w-full flex gap-4 items-center cursor-pointer"
              aria-label={`Voir le profil de ${user.FirstName} ${user.LastName}`}
            >
              <img
                src={user.profileUrl || NoProfile}
                alt={`${user.FirstName} ${user.LastName}`}
                className="w-10 h-10 object-cover rounded-full"
              />
              <div className="flex-1">
                <p className="text-base font-medium text-ascent-1">
                  {user.firstName} {user.lastName}
                </p>
                <span className="text-sm text-ascent-2">{user.profession}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-ascent-2">Aucun utilisateur trouvé dans cet arbre.</p>
        )}
      </div>
    </div>
  );
}

export default FamilyUserList
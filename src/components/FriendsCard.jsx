import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { NoProfile } from "../assets";
import { URL_BACKEND } from "../utils/url_back";

const FriendsCard = ({ userId }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserFriends = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${URL_BACKEND}/api/users/${userId}/friends`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      console.error("Error fetching user friends:", error);
      throw error;
    }
  };

  useEffect(() => {
    const loadFriends = async () => {
      try {
        setLoading(true);
        const data = await fetchUserFriends();
        
        // Vérifiez la structure de la réponse dans la console
        // console.log("API Response:", data);
        
        // Adaptez cette ligne selon la structure exacte de votre réponse API
        // Voici quelques possibilités selon différentes structures de réponse
        const friendsList = data?.data?.Friends || 
                          data?.data?.friends || 
                          data?.Friends || 
                          data?.friends || 
                          [];
        
        setFriends(friendsList);
      } catch (err) {
        setError(err.message || "Failed to load friends");
        console.error("Error in loadFriends:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadFriends();
    }
  }, [userId]);

  // if (loading) {
  //   return (
  //     <div className='w-full bg-primary shadow-sm rounded-lg px-6 py-5'>
  //       <p>Loading friends...</p>
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className='w-full bg-primary shadow-sm rounded-lg px-6 py-5'>
        <p className='text-red-500'>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className='w-full bg-primary shadow-sm rounded-lg px-6 py-5'>
      <div className='flex items-center justify-between text-ascent-1 pb-2 border-b border-[#66666645]'>
        <span>Friends</span>
        <span>{friends?.length}</span>
      </div>

      <div className='w-full flex flex-col gap-4 pt-4'>
        {friends?.length > 0 ? (
          friends.map((friend) => (
            <Link
              to={"/profile/" + (friend?.Id || friend?.id || friend?._id)}
              key={friend?.Id || friend?.id || friend?._id}
              className='w-full flex gap-4 items-center cursor-pointer'
            >
              <img
                src={friend?.ProfileUrl || friend?.profileUrl || NoProfile}
                alt={friend?.FirstName || friend?.firstName || "Friend"}
                className='w-10 h-10 object-cover rounded-full'
              />
              <div className='flex-1'>
                <p className='text-base font-medium text-ascent-1'>
                  {(friend?.FirstName || friend?.firstName || "") + " " + 
                   (friend?.LastName || friend?.lastName || "")}
                </p>
                <span className='text-sm text-ascent-2'>
                  {friend?.Profession || friend?.profession || "No Profession"}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <p className='text-ascent-2'>No friends to show</p>
        )}
      </div>
    </div>
  );
};

export default FriendsCard;
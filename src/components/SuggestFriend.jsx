import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import axios from "axios";
import { NoProfile } from "../assets";
import { URL_BACKEND } from "../utils/url_back";
import { BsPersonFillAdd } from 'react-icons/bs';

const SuggestFriend = () => {
  const [friendSuggested, setFriendSuggested] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestStatus, setRequestStatus] = useState({});
  
  const userId = localStorage.getItem("id"); // Ajouté

  const fetchFriendSuggest = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${URL_BACKEND}/api/Users/suggested-friends`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      console.error("Error fetching friends Suggestions:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch suggestions");
    }
  };

  const sendFriendRequest = async (RequestFromId) => {
    try {
      setRequestStatus((prev) => ({
        ...prev,
        [RequestFromId]: { isSubmitting: true, message: null },
      }));

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.post(
        `${URL_BACKEND}/api/Users/friend-request`,
        { RequestToId: RequestFromId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.Success) {
        setRequestStatus((prev) => ({
          ...prev,
          [RequestFromId]: {
            isSubmitting: false,
            sent: true,
            message: { status: "success", text: "Friend request sent successfully" },
          },
        }));
        setTimeout(() => {
          setRequestStatus((prev) => ({
            ...prev,
            [RequestFromId]: { ...prev[RequestFromId], message: null },
          }));
        }, 3000); // Effacer le message après 3 secondes
      } else {
        throw new Error(response.data?.Message || "Failed to send friend request");
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      setRequestStatus((prev) => ({
        ...prev,
        [RequestFromId]: {
          isSubmitting: false,
          sent: false,
          message: {
            status: "error",
            text: error.response?.data?.Message || "Failed to send friend request",
          },
        },
      }));
    }
  };

  useEffect(() => {
    const loadFriends = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchFriendSuggest();
        
        // Version plus robuste pour extraire les suggestions
        const suggestions = data?.data || data || [];
        setFriendSuggested(Array.isArray(suggestions) ? suggestions : []);
      } catch (err) {
        setError(err.message || "Failed to load friend suggestions");
        console.error("Error loading suggestions:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      loadFriends();
    } else {
      setError("User ID not found. Please log in.");
      setLoading(false);
    }
  }, [userId]);

  if (loading) {
    return (
      <div className='w-full bg-primary shadow-sm rounded-lg px-6 py-5'>
        <p className='text-ascent-2'>Loading suggestions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='w-full bg-primary shadow-sm rounded-lg px-6 py-5'>
        <p className='text-red-500'>{error}</p>
      </div>
    );
  }

  return (
    <div className='w-full bg-primary shadow-sm rounded-lg px-5 py-5'>
      <div className='flex items-center justify-between text-ascent-1 pb-2 border-b border-[#66666645]'>
        <span>Friend Suggestion</span>
        <span>{friendSuggested.length}</span>
      </div>

      <div className='w-full flex flex-col gap-4 pt-4'>
        {friendSuggested.length > 0 ? (
          friendSuggested.map((friend) => (
            <Link
              to={`/profile/${friend?.id || friend?.Id}`}
              key={friend?.id || friend?.Id}
              className='w-full flex gap-4 items-center cursor-pointer'
            >
              <img
                src={friend?.profileUrl || friend?.ProfileUrl || NoProfile}
                alt={friend?.firstName || friend?.FirstName || "Friend"}
                className='w-10 h-10 object-cover rounded-full'
              />
              <div className='flex-1'>
                <p className='text-base font-medium text-ascent-1'>
                  {`${friend?.firstName || friend?.FirstName || ""} ${friend?.lastName || friend?.LastName || ""}`.trim()}
                </p>
                <span className='text-sm text-ascent-2'>
                  {friend?.profession || friend?.Profession || "No Profession"}
                </span>
              </div>
              <button
                className='bg-[#0444a430] text-sm text-white p-1 rounded'
                onClick={() => {sendFriendRequest(friend?.id || friend?.Id)}}
              >
                <BsPersonFillAdd size={20} className='text-[#0f52b6]' />
              </button>
            </Link>
          ))
        ) : (
          <p className='text-ascent-2'>No friend suggestions available</p>
        )}
      </div>
    </div>
  );
};

export default SuggestFriend;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CustomButton } from '../components';
import axios from 'axios';
import { URL_BACKEND } from '../utils/url_back';
import { NoProfile } from '../assets';

const FriendRequest = () => {
    const [friendRequest, setFriendRequest] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    const userId = localStorage.getItem("id");

    const handleFriendRequestAction = async (requestId, action) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found");

            setLoading(true);
            setError(null);

            const response = await axios.post(
                `${URL_BACKEND}/api/Users/${action}-request`,
                { 
                    RequestId: requestId,
                    ...(action === 'accept' && { Status: "Accepted" })
                },
                { 
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    } 
                },
            );

            if (response.data?.success) {
                setFriendRequest(prev => prev.filter(req => req._id !== requestId));
                setSuccessMsg(`Friend request ${action}ed successfully`);
                setTimeout(() => setSuccessMsg(null), 3000);
            } else {
                throw new Error(response.data?.message || "Action failed");
            }
        } catch (error) {
            console.error(`Error ${action}ing friend request:`, error);
            setError(error.response?.data?.message || `Failed to ${action} friend request`);
            console.log("error",error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFriendRequests = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found");
            if (!userId) throw new Error("User ID not found. Please log in.");

            const response = await axios.get(
                `${URL_BACKEND}/api/Users/friend-requests?requestToId=${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!response.data?.success) {
                throw new Error(response.data?.message || "Failed to fetch requests");
            }

            return response.data.data || [];
        } catch (error) {
            throw error;
        }
    };

    useEffect(() => {
        const loadFriendsRequests = async () => {
            try {
                setLoading(true);
                setError(null);
                const requests = await fetchFriendRequests();
                setFriendRequest(requests);
            } catch (err) {
                console.error("Error loading friend requests:", err);
                setError(err.message || "Failed to load friend requests");
                setFriendRequest([]);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            loadFriendsRequests();
        } else {
            setError("User ID not found. Please log in.");
        }
    }, [userId]);

    return (
        <div className='w-full bg-primary shadow-sm rounded-lg px-6 py-5'>
            <div className='flex items-center justify-between text-xl text-ascent-1 pb-2 border-b border-[#66666645]'>
                <span>Friend Request</span>
                <span>{friendRequest?.length || 0}</span>
            </div>

            <div className='w-full flex flex-col gap-4 pt-4'>
                {loading ? (
                    <p className='text-ascent-2'>Loading...</p>
                ) : error ? (
                    <p className='text-red-500'>{error}</p>
                ) : successMsg ? (
                    <p className='text-green-500'>{successMsg}</p>
                ) : friendRequest.length > 0 ? (
                    friendRequest.map(({ _id, requestFrom }) => (
                        <div key={requestFrom.id} className='flex items-center justify-between'>
                            <Link
                                to={`/profile/${requestFrom?.id || ''}`}
                                className='w-full flex gap-4 items-center cursor-pointer'
                                aria-label={`View profile of ${requestFrom?.firstName || ''} ${requestFrom?.lastName || ''}`}
                            >
                                <img
                                    src={requestFrom?.profileUrl ?? NoProfile}
                                    alt={`${requestFrom?.firstName || ''} ${requestFrom?.lastName || ''}`}
                                    className='w-10 h-10 object-cover rounded-full'
                                />
                                <div className='flex-1'>
                                    <p className='text-base font-medium text-ascent-1'>
                                        {requestFrom?.firstName || 'Unknown'} {requestFrom?.lastName || 'User'}
                                    </p>
                                    <span className='text-sm text-ascent-2'>
                                        {requestFrom?.profession ?? 'No Profession'}
                                    </span>
                                </div>
                            </Link>

                            <div className='flex gap-1'>
                                <CustomButton
                                    title='Accept'
                                    containerStyles='bg-[#0444a4] text-xs text-white px-1.5 py-1 rounded-full'
                                    onClick={() => handleFriendRequestAction(_id, 'accept')}
                                    disabled={loading}
                                    aria-label={`Accept friend request from ${requestFrom?.firstName || ''} ${requestFrom?.lastName || ''}`}
                                />
                                <CustomButton
                                    title='Deny'
                                    containerStyles='border border-[#666] text-xs text-ascent-1 px-1.5 py-1 rounded-full'
                                    onClick={() => handleFriendRequestAction(_id, 'deny')}
                                    disabled={loading}
                                    aria-label={`Deny friend request from ${requestFrom?.firstName || ''} ${requestFrom?.lastName || ''}`}
                                />
                            </div>
                        </div>
                    ))
                ) : (
                    <p className='text-ascent-2'>No friend requests</p>
                )}
            </div>
        </div>
    );
};

export default FriendRequest;
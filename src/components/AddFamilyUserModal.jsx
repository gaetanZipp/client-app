import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';

const AddFamilyUserModal = () => {

    const { addFamilyUser } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const [errMsg, setErrMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    const familyTreeId = localStorage.getItem("familyTreeId");

    return (
        <div>AddFamilyUserModal</div>
    )
}

export default AddFamilyUserModal
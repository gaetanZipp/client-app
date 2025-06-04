import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { URL_BACKEND } from "../utils/url_back";
import { NoProfile } from "../assets";
import { CreateFamily } from "../redux/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { LiaEditSolid } from "react-icons/lia";
import CreateFamilyTree from "./CreateFamilyTree";

const FamilyTree = ( userId ) => {
  const [familyTrees, setFamilyTrees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const {createTree} = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const id = localStorage.getItem("id");

  useEffect(() => {
    const fetchFamilyTrees = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");

        const response = await fetch(`${URL_BACKEND}/api/FamilyUsers/user/${id}/familytrees`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch family trees");
        }
        const data = await response.json();
        setFamilyTrees(Array.isArray(data) ? data : []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFamilyTrees();
    } else {
      setError("User ID not found. Please log in.");
    }
  }, [id]);

    return (
    <div className="w-full bg-primary shadow-sm rounded-lg flex flex-col px-6 py-4">
      <div className="flex items-center justify-between pb-2 text-ascent-1 border-b border-[#66666645]">
        <span>Family Trees</span>
        <span>
          <LiaEditSolid
            size={22}
            className="text-blue cursor-pointer"
            onClick={() => dispatch(CreateFamily(true))}
            aria-label="Create new family tree"
          />
        </span>
      </div>

      {createTree && <CreateFamilyTree />}

      <div className="w-full flex flex-col gap-4 pt-4">
        {loading ? (
          <p className="text-ascent-2">Loading...</p>
        ) : error ? (
          <p className="text-[#f64949fe]">{error}</p>
        ) : familyTrees.length > 0 ? (
          familyTrees.map((family) => (
            <Link
              key={family.id}
              className="w-full flex gap-4 items-center cursor-pointer"
              aria-label={`View family tree ${family.lastName || "Unknown"}`}
              onClick={(e) => {
                e.preventDefault(); // Empêche la navigation immédiate (optionnel)
                localStorage.setItem("familyTreeId", family.id.toString());
                window.location.reload();
              }}
            >
              {/* <img
                src={NoProfile}
                alt="Family Tree"
                className="w-10 h-10 object-cover rounded-full"
              /> */}
              <div className="flex-1">
                <p className="text-base font-medium text-ascent-1">
                  {family.lastName || "Unknown"}
                </p>
                <span className="text-sm text-ascent-2">
                  {family.description || "No description"}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-ascent-2">No family tree to show</p>
        )}
      </div>
    </div>
  );
};

export default FamilyTree;
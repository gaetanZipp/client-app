import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { CustomButton, TextInput, FriendsCard, FriendRequest, ProfileCard, TopBar, SuggestFriend, PostCard, Loading, EditProfile } from '../components'
import { Link } from 'react-router-dom'
import { posts } from '../assets/data'
import { NoProfile } from '../assets'
import { useForm } from 'react-hook-form'
import { BsFiletypeGif, BsPersonFillAdd } from "react-icons/bs";
import { BiImages, BiSolidVideo } from "react-icons/bi";

const Home = () => {
    const id = localStorage.getItem("id")
    const [loading, setLoading] = useState(false);
    const {user, edit} = useSelector((state => state.user));
    const [errMsg, setErrMsg] = useState("");
    const [file, setFile] = useState(null);
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();
    
    return (
        <>
            <div className='w-full px-0 lg:px-10 pb-20 2xl:px-40 bg-bgColor lg:rounded-lg h-screen overflow-hidden'>
                <TopBar />

                <div className='w-full flex gap-2 lg:gap-4 pt-5 pb-10 h-full'>
                    {/* LEFT */}
                    <div className='hidden w-1/3 lg:w-1/4 h-full md:flex flex-col gap-6 overflow-y-auto'>
                        <ProfileCard userId = {id} />
                        <FriendsCard userId = {id} />
                    </div>
                    {/* CENTER */}
                    <div className='flex-1 h-full px-4 flex flex-col gap-6 overflow-y-auto rounded-lg'>
                        <form
                            className='bg-primary px-4 rounded-lg'
                        >
                            <div className='w-full flex items-center gap-2 py-4 border-b border-[#66666645]'>
                                <img
                                src={user?.profileUrl ?? NoProfile}
                                alt='User Image'
                                className='w-14 h-14 rounded-full object-cover'
                                />
                                <TextInput
                                styles='w-full rounded-full py-5'
                                placeholder="What's on your mind...."
                                name='description'
                                register={register("description", {
                                    required: "Write something about post",
                                })}
                                error={errors.description ? errors.description.message : ""}
                                />
                            </div>
                            {errMsg?.message && (
                                <span
                                role='alert'
                                className={`text-sm ${
                                    errMsg?.status === "failed"
                                    ? "text-[#f64949fe]"
                                    : "text-[#2ba150fe]"
                                } mt-0.5`}
                                >
                                {errMsg?.message}
                                </span>
                            )}

                            <div className='flex items-center justify-between py-4'>
                                <label
                                htmlFor='imgUpload'
                                className='flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer'
                                >
                                <input
                                    type='file'
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className='hidden'
                                    id='imgUpload'
                                    data-max-size='5120'
                                    accept='.jpg, .png, .jpeg'
                                />
                                <BiImages />
                                <span>Image</span>
                                </label>

                                <label
                                className='flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer'
                                htmlFor='videoUpload'
                                >
                                <input
                                    type='file'
                                    data-max-size='5120'
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className='hidden'
                                    id='videoUpload'
                                    accept='.mp4, .wav'
                                />
                                <BiSolidVideo />
                                <span>Video</span>
                                </label>

                                <label
                                className='flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer'
                                htmlFor='vgifUpload'
                                >
                                <input
                                    type='file'
                                    data-max-size='5120'
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className='hidden'
                                    id='vgifUpload'
                                    accept='.gif'
                                />
                                <BsFiletypeGif />
                                <span>Gif</span>
                                </label>

                                <div>
                                {posting ? (
                                    <Loading />
                                ) : (
                                    <CustomButton
                                    type='submit'
                                    title='Post'
                                    containerStyles='bg-[#0444a4] text-white py-1 px-6 rounded-full font-semibold text-sm'
                                    />
                                )}
                                </div>
                            </div>
                        </form>
                        <div className='flex-1 h-full bg-primary px-4 flex flex-col gap-6 overflow-y-auto'>
                            <div className='w-full bg-primary shadow-sm rounded-lg px-6 py-52 gap-6'>
                            <div className='flex w-full h-full items-center justify-center'>
                                <h2 className='text-2xl text-ascent-1'>
                                    how to build your family tree
                                </h2>
                                <Link to="/familytree" className='bg-[#0444a4] text-xl text-white px-20 py-5 rounded-full'>
                                    Discover
                                </Link>
                            </div>
                        </div>
                            {loading ? (
                                <Loading />
                            ) : posts?.length > 0 ? (
                                posts?.map((post) => (
                                <PostCard 
                                    post={post}
                                    key={post?._id}
                                    user={user}
                                    // deletePost={handleDeletePost}
                                    // likePost={handleLikePost}
                                />
                                ))
                            ) : (
                                <div className='flex w-full h-full items-center justify-center'>
                                <p className='text-lg text-ascent-2'>No Post Available</p>
                                </div>
                            )
                            }
                        </div>
                    </div>
                    <div className='hidden w-1/4 h-full lg:flex flex-col gap-8 overflow-y-auto'>
                        <FriendRequest />
                        <SuggestFriend />
                    </div>
                </div>
            </div>

            {edit && <EditProfile />}
        </>
    )
}

export default Home
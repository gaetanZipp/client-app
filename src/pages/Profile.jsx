import React, { useState } from 'react'
import { FamilyTree, FriendsCard, PostCard, ProfileCard, TopBar } from '../components'
import { useParams } from 'react-router-dom'
import { posts } from '../assets/data'
import { useSelector } from 'react-redux'

const Profile = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.user)

  return (
    <div className='home w-full px-0 lg:px-10 pb-20 2xl:px:40 bg-bgColor lg:rounded-lg h-screen overflow-hidden'>
        <TopBar />
        <div className='w-full flex gap-2 lg:gap-4 md:pl-4 pt-5 pb-10 h-full'>
          <div className='hidden w-1/3 lg:w-1/4 md:flex flex-col gap-6 overflow-y-auto'>
            <ProfileCard userId={id}/>
            <FamilyTree userId={id}/>
            <div className='block lg:hidden'>
              <FriendsCard userId={id} />
            </div>
          </div>

          <div className='flex-1 h-full bg-primary px-4 flex flex-col gap-6 overflow-y-auto'>
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
          <div className='hidden w-1/4 h-full lg:flex flex-col gap-8 overflow-y-auto'>
            <FriendsCard userId={id} />
          </div>
        </div>
    </div>
  )
}

export default Profile
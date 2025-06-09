import React from 'react'
import { FamilyTree, Person, PersonList, ProfileCard, TopBar } from '../components'
import { useSelector } from 'react-redux'
import FamilyUserList from '../components/FamilyUserList';

const Family = () => {
    const id = localStorage.getItem("id");
    const { user } = useSelector((state) => state.user)
    return (
        <div className='w-full px-0 lg:px-10 pb-20 2xl:px-40 bg-bgColor lg:rounded-lg h-screen overflow-hidden'>
            <TopBar />
            <div className='w-full flex gap-2 lg:gap-4 pt-5 pb-10 h-full'>
                {/* LEFT */}
                <div className='hidden w-1/3 lg:w-1/4 h-full md:flex flex-col gap-6 overflow-y-auto'>
                    <ProfileCard userId = {id} />
                    <FamilyTree />
                </div>
                {/* CENTER */}
                <div className='flex-1 h-full px-4 flex flex-col gap-6 overflow-y-auto rounded-lg'>
                    <div className='flex-1 w-full bg-primary px-4 flex flex-col gap-6 overflow-y-auto'>
                        <div className='flex w-full h-full items-center justify-center'>
                            <Person />
                        </div>
                    </div>
                </div>
                {/* RIGHT */}
                <div className='hidden w-1/4 h-full lg:flex flex-col gap-8 overflow-y-auto'>
                    <PersonList />
                    <FamilyUserList />
                    {/* <PartnerManager /> */}
                </div>
            </div>
        </div>
    )
}

export default Family
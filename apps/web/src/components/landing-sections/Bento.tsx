'use client'
import React from 'react'
import OrbitComponent from '../ui/orbit'
import CardStack from '../ui/card-stack'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Header from '../ui/header'

const Bento = () => {
    return (
        <div id='features' className="flex flex-col w-full">
            <Header title="Supercharge Your Open Source Journey"/>
            <div className="w-full border-b border-[#252525] flex flex-col  lg:flex-row overflow-hidden">
                <div className="border-b lg:border-b-0 lg:border-r border-[#252525] lg:w-1/2 lg:aspect-square relative overflow-hidden p-2 flex-shrink-0 space-y-1 h-[400px] lg:h-full">
                    <div className="border border-dashed border-[#252525] w-full h-full relative overflow-hidden p-[30px] flex-shrink-0 space-y-1 flex flex-col items-center justify-start gap-4 z-10">
                        <div className="w-full z-10">
                            <motion.h5
                                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                transition={{ duration: 0.6, ease: 'easeOut', type: 'spring', delay: 0.35 }}
                                className='text-2xl lg:text-3xl tracking-tighter text-left'>Seamless Search </motion.h5>
                            <motion.p
                                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                transition={{ duration: 0.6, ease: 'easeOut', type: 'spring', delay: 0.35 }}
                                className='tracking-tight text-sm lg:text-lg text-[#d1d1d1]'>Search thousands of open-source repos instantly.</motion.p>
                        </div>
                        <div className="absolute w-full h-full top-0 left-0">
                            <div className="absolute h-full w-full z-10"></div>

                            <Image
                                src="/assets/mask.svg"
                                alt="background"
                                fill
                                className="object-cover w-full h-full opacity-60 "
                            />
                        </div>
                        <div className="absolute h-full w-full bg-gradient-to-t from-[#101010]/75 via-transparent to-[#101010]/75 top-0 left-1/2 -translate-x-1/2"></div>
                        <div className="absolute h-full w-full bg-gradient-to-r from-[#101010]/75 via-transparent to-[#101010]/75 top-0 left-1/2 -translate-x-1/2"></div>
                        <div className="lg:translate-y-16 translate-y-5">
                            <OrbitComponent />
                        </div>
                        <div className="h-[90px] absolute -bottom-10 w-full bg-[#101010] blur-[15px]"></div>
                    </div>
                </div>
                <div className="lg:w-1/2 lg:aspect-square relative overflow-hidden p-2 flex-shrink-0 space-y-1 h-[400px] lg:h-full">
                    <div className="border border-dashed border-[#252525] w-full h-full relative overflow-hidden p-[30px] flex-shrink-0 flex flex-col gap-4 lg:gap-0 ">
                        <div className="space-y-1 flex-shrink-0 z-10">
                            <motion.h5
                                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                transition={{ duration: 0.6, ease: 'easeOut', type: 'spring', delay: 0.35 }}
                                className='text-2xl lg:text-3xl tracking-tighter text-left'>Precision Filters </motion.h5>
                            <motion.p
                                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                transition={{ duration: 0.6, ease: 'easeOut', type: 'spring', delay: 0.35 }}
                                className='tracking-tight text-sm lg:text-lg text-[#d1d1d1]'>Zero in on projects by language, stack and activity level.</motion.p>
                        </div>
                        <div className="h-full w-full flex items-center lg:pt-10 lg:pb-4  relative overflow-hidden z-20">
                            <CardStack />
                        </div>

                        <div className="absolute w-full h-full top-0 left-0">
                            <div className="absolute h-full w-full   z-10"></div>

                            <Image
                                src="/assets/mask.svg"
                                alt="background"
                                fill
                                className="object-cover w-full h-full opacity-60 "
                            />
                        </div>
                        <div className="absolute h-full w-full bg-gradient-to-t from-[#101010]/75 via-transparent to-[#101010]/75 top-0 left-1/2 -translate-x-1/2"></div>
                        <div className="absolute h-full w-full bg-gradient-to-r from-[#101010]/75 via-transparent to-[#101010]/75 top-0 left-1/2 -translate-x-1/2"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Bento
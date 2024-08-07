'use client'

import axios from 'axios'
import MuxPlayer from '@mux/mux-player-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Loader2, Lock, Loader } from 'lucide-react'
import Image from 'next/image'


import { cn } from '@/lib/utils'
import { useConfettiStore } from '@/hooks/use-confetti'

interface VideoPlayerProps {
    playbackId: string
    courseId: string
    chapterId: string
    nextChapterId?: string
    isLocked: boolean
    completeOnEnd: boolean
    title: string
    imageUrl: string
  }

  export const VideoPlayer = ({
    playbackId,
    courseId,
    chapterId,
    nextChapterId,
    isLocked,
    completeOnEnd,
    title,
    imageUrl
  }: VideoPlayerProps) => {
    const [isReady, setIsReady] = useState(false)
    const router = useRouter()
    const confetti = useConfettiStore()
  
    const onEnd = async () => {
        try {
          if (completeOnEnd) {
            await axios.put(`/api/courses/${courseId}/chapters/${chapterId}/progress`, {
              isCompleted: true,
            })

            if (!nextChapterId) {
                confetti.onOpen()
              }

              toast.success('Progress updated')
              router.refresh()
      
              if (nextChapterId) {
                router.push(`/courses/${courseId}/chapters/${nextChapterId}`)
              }
            }
          } catch {
            toast.error('Something went wrong')
          }
        }

        return (
            <div className="relative aspect-video">
              {!isReady && !isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                    <Image fill className="object-cover" alt={title} src={imageUrl} />
                  <Loader className=" h-16 w-16 animate-spin text-secondary z-100" />
                </div>
              )}
              {isLocked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-y-2 bg-slate-800 text-secondary">
                  <Lock className="h-8 w-8" />
                  <p className="text-sm">This chapter is locked</p>
                </div>
              )}
              {!isLocked && (
                <MuxPlayer
                  title={title}
                  className={cn(!isReady && 'hidden')}
                  onCanPlay={() => setIsReady(true)}
                  onEnded={onEnd}
                  autoPlay
                  playbackId={playbackId}
                />
              )}
            </div>
          )
        }
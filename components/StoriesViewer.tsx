'use client'
import Image from "next/image"
import { ChangeEvent, useEffect, useRef, useState } from "react"
import Button from "./Button"

type Story = {
  _id: string
  img: string
  uploadedAt: string
}

const StoriesViewer = () => {
  const [stories, setStories] = useState<Story[]>([])
  const [activeStory, setActiveStory] = useState<Story | null>(null)
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout>(null)

  useEffect(() => {
    setIsLoading(true)
    fetch('/api/stories', { method: "GET" })
      .then(res => res.json())
      .then(data => {
        setStories(data)
        setIsLoading(false)
      })
      .catch(() => {
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!activeStory || isPaused) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
      return
    }

    const duration = 5000
    const startTime = Date.now() - (progress / 100) * duration

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = (elapsed / duration) * 100

      if (newProgress >= 100) handleNextStory()
      else setProgress(newProgress)
    }, 16)

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }, [activeStory, isPaused, currentStoryIndex])

  const handleNextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1)
      setActiveStory(stories[currentStoryIndex + 1])
      setProgress(0)
    } else {
      closeOverlay()
    }
  }

  const handlePrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1)
      setActiveStory(stories[currentStoryIndex - 1])
      setProgress(0)
    }
  }

  const closeOverlay = () => {
    setActiveStory(null)
    setCurrentStoryIndex(0)
    setProgress(0)
    setIsPaused(false)
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
  }

  function handleStoryClick(story: Story) {
    const index = stories.findIndex(s => s._id === story._id)
    setCurrentStoryIndex(index)
    setActiveStory(story)
    setProgress(0)
    setIsPaused(false)
  }

  async function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const reader = new FileReader()

    reader.onload = async () => {
      try {
        await fetch('/api/stories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            img: reader.result,
            uploadedAt: new Date(),
            endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          }),
        })

        const stories = await fetch('/api/stories').then(res => res.json())
        setStories(stories)
      } catch (error) {
        console.error('Failed to upload story:', error)
      } finally {
        setIsUploading(false)
      }
    }

    reader.onerror = () => {
      console.error('Error reading file')
      setIsUploading(false)
    }

    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const handleDragScroll = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    let startX = e.pageX - container.offsetLeft
    let scrollLeft = container.scrollLeft
    container.style.cursor = 'grabbing'

    const handleMouseMove = (ev: MouseEvent) => {
      const x = ev.pageX - container.offsetLeft
      const walk = (x - startX) * 1.5
      container.scrollLeft = scrollLeft - walk
    }

    const stopDragging = () => {
      container.style.cursor = 'grab'
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', stopDragging)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', stopDragging)
  }

  const handleTouchScroll = (e: React.TouchEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    const startX = e.touches[0].pageX
    const scrollLeft = container.scrollLeft

    const handleMove = (ev: TouchEvent) => {
      const x = ev.touches[0].pageX
      const walk = (x - startX) * 1.5
      container.scrollLeft = scrollLeft - walk
    }

    const stop = () => {
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('touchend', stop)
    }

    document.addEventListener('touchmove', handleMove)
    document.addEventListener('touchend', stop)
  }

  return (
    <div className="flex flex-col min-h-[400px] w-full p-2 md:p-4 h-full pb-4 flex-1 justify-between relative">
      <div className="flex-shrink-0 mb-4 md:mb-6">
        {isLoading ? (
          <div className="w-full h-24 md:h-32 lg:h-36 rounded-xl md:rounded-2xl py-3 md:py-4 px-3 md:px-6 bg-white shadow-sm border md:border-2 border-black overflow-hidden flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 text-sm">Loading stories...</p>
            </div>
          </div>
        ) : stories.length > 0 ? (
          <div className="min-h-24 md:min-h-32 lg:min-h-36 rounded-xl md:rounded-2xl bg-white shadow-sm border md:border-2 border-black overflow-hidden w-full max-w-full">
            <div
              className="flex gap-2 md:gap-3 lg:gap-4 px-4 py-3 h-full items-center overflow-x-auto scrollbar-hide select-none w-full"
              style={{ scrollBehavior: 'smooth', cursor: 'grab' }}
              onMouseDown={handleDragScroll}
              onTouchStart={handleTouchScroll}
            >
              {stories.map((story) => (
                <div
                  key={story._id}
                  className="flex flex-col items-center gap-1 md:gap-2 cursor-pointer group flex-shrink-0"
                  onClick={() => handleStoryClick(story)}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full transform group-hover:scale-110 transition-transform duration-200" />
                    <div className="relative bg-white rounded-full p-0.5 transform group-hover:scale-105 transition-transform duration-200">
                      <div className="relative w-14 h-14 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-full overflow-hidden">
                        <Image
                          src={story.img}
                          alt="Story"
                          fill
                          className="object-cover"
                          unoptimized
                          sizes="(max-width: 768px) 48px, (max-width: 1024px) 64px, 80px"
                        />
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 font-medium max-w-[60px] md:max-w-[70px] truncate text-center">
                    {formatTime(story.uploadedAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 md:py-16 text-center">
            <div className="w-32 h-32 md:w-48 md:h-48 mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <div className="text-4xl md:text-6xl">📱</div>
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
              No Stories Yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md text-sm md:text-base">
              Be the first to share a moment! Upload a photo to start your story.
            </p>
          </div>
        )}
      </div>

      {activeStory && (
        <div className="flex-1 mb-4 md:mb-6 rounded-xl md:rounded-2xl overflow-hidden border-2 border-black bg-black relative min-h-64 md:min-h-80 lg:min-h-96">
          <div className="absolute top-3 md:top-4 left-3 md:left-4 right-3 md:right-4 flex gap-1 z-10">
            {stories.map((_, index) => (
              <div key={index} className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-75 ${
                    index === currentStoryIndex 
                      ? 'bg-gradient-to-r from-cyan-400 to-purple-500' 
                      : index < currentStoryIndex 
                      ? 'bg-white' 
                      : 'bg-gray-600'
                  }`}
                  style={{
                    width: index === currentStoryIndex 
                      ? `${Math.min(progress, 100)}%` 
                      : index < currentStoryIndex 
                      ? '100%' 
                      : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          <div className="absolute top-4 md:top-6 left-3 md:left-4 right-3 md:right-4 flex items-center justify-between z-10 px-2">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">You</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-medium text-sm">Your Story</span>
                <span className="text-gray-300 text-xs">
                  {formatTime(activeStory.uploadedAt)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="text-white hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-white/10 text-lg md:text-xl"
              >
                {isPaused ? '▶' : '⏸'}
              </button>
              <button
                onClick={closeOverlay}
                className="text-white hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-white/10 text-xl md:text-2xl"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center h-full w-full relative">
            {currentStoryIndex > 0 && (
              <div
                className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 flex items-center justify-center text-white text-xl md:text-2xl cursor-pointer hover:bg-white/20 rounded-full transition-colors z-20 backdrop-blur-sm"
                onClick={handlePrevStory}
              >
                ‹
              </div>
            )}

            {currentStoryIndex < stories.length - 1 && (
              <div
                className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 flex items-center justify-center text-white text-xl md:text-2xl cursor-pointer hover:bg-white/20 rounded-full transition-colors z-20 backdrop-blur-sm"
                onClick={handleNextStory}
              >
                ›
              </div>
            )}

            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={activeStory.img}
                alt="Story"
                fill
                className="object-contain"
                unoptimized
                priority
              />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

          <div
            className="absolute left-0 top-0 bottom-0 w-1/4 md:w-1/3 cursor-pointer"
            onClick={handlePrevStory}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-1/4 md:w-1/3 cursor-pointer"
            onClick={handleNextStory}
          />
        </div>
      )}

      <div className="w-full max-w-xs md:max-w-md lg:max-w-lg mx-auto px-4 pb-4 flex-shrink-0">
        <input
          className="hidden"
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/png,image/jpeg,image/webp"
          disabled={isUploading}
        />
        <Button
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-medium text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Add Story'}
        </Button>
      </div>
    </div>
  )
}

export default StoriesViewer

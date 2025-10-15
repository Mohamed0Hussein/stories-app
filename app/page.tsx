import StoriesViewer from '@/components/StoriesViewer'
import './globals.css'

const page = () => {
  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto px-4 md:px-8">
      <h2 className="text-center font-bold text-2xl md:text-3xl lg:text-4xl my-4 md:my-6">S7so Stories Store</h2>
      <div className="flex h-full border-2 border-black rounded-lg flex-col mb-4">
        <StoriesViewer/>
      </div>
    </div>
  )
}

export default page
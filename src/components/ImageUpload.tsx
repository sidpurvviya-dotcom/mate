'use client'
import { useState, useRef } from 'react'

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

export default function ImageUpload({ images, onChange, maxImages = 10 }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const fileArray = Array.from(files)
    
    if (images.length + fileArray.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images.`)
      return
    }

    const newPhotos: string[] = []
    let processed = 0

    fileArray.forEach(file => {
      if (!file.type.startsWith('image/')) {
        processed++
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        newPhotos.push(reader.result as string)
        processed++
        if (processed === fileArray.length) {
          onChange([...images, ...newPhotos])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  return (
    <div className="flex flex-col gap-8">
      <input 
        type="file" 
        ref={fileInputRef}
        multiple 
        accept="image/*" 
        style={{ display: 'none', visibility: 'hidden', position: 'absolute' }}
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div 
        className={`relative group border-2 border-dashed rounded-[3rem] p-16 transition-all duration-700 flex flex-col items-center justify-center cursor-pointer overflow-hidden
          ${isDragging ? 'border-primary bg-primary/5 scale-[1.03] shadow-[0_40px_80px_rgba(99,102,241,0.15)]' : 'border-gray-200 bg-gradient-to-br from-gray-50/50 to-white hover:border-primary/50 hover:shadow-2xl'}
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => fileInputRef.current?.click()}
      >
        
        {/* REFINED GIGANTIC FILE STACK HERO */}
        <div className="relative mb-14">
          <div className="w-72 h-72 relative flex items-center justify-center transition-transform group-hover:scale-105 duration-700 ease-out">
            
            {/* Background File 1 */}
            <div className="absolute w-40 h-56 bg-gradient-to-br from-blue-50 to-blue-100 rounded-[2rem] border-[1px] border-blue-200/50 rotate-[-18deg] translate-x-[-35px] group-hover:rotate-[-28deg] group-hover:translate-x-[-75px] transition-all duration-700 shadow-sm flex flex-col p-5 gap-3">
               <div className="w-1/2 h-2 bg-blue-200/50 rounded-full" />
               <div className="w-full h-1 bg-blue-200/30 rounded-full" />
               <div className="mt-auto w-full aspect-video bg-blue-200/20 rounded-xl" />
            </div>
            
            {/* Background File 2 */}
            <div className="absolute w-40 h-56 bg-gradient-to-br from-purple-50 to-purple-100 rounded-[2rem] border-[1px] border-purple-200/50 rotate-[18deg] translate-x-[35px] group-hover:rotate-[28deg] group-hover:translate-x-[75px] transition-all duration-700 shadow-sm flex flex-col p-5 gap-3">
               <div className="w-1/2 h-2 bg-purple-200/50 rounded-full" />
               <div className="w-full h-1 bg-purple-200/30 rounded-full" />
               <div className="mt-auto w-full aspect-video bg-purple-200/20 rounded-xl" />
            </div>
            
            {/* Front Main Card */}
            <div className="relative w-40 h-56 bg-white rounded-[2rem] border-[1.5px] border-gray-100 shadow-[0_25px_60px_rgba(0,0,0,0.12)] flex items-center justify-center z-10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent rotate-45 translate-y-[-50%] group-hover:translate-y-[50%] transition-transform duration-1000" />
              
              <div className="flex flex-col items-center gap-6 relative z-20">
                {/* LARGE CENTRAL FILE STACK LOGO */}
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white shadow-xl ring-[10px] ring-indigo-50 transition-all duration-500 group-hover:scale-110">
                   <div className="relative w-14 h-16 flex items-center justify-center">
                      <div className="absolute w-10 h-13 bg-white/20 rounded-lg border border-white/40 rotate-[-15deg] translate-x-[-6px]" />
                      <div className="absolute w-10 h-13 bg-white/20 rounded-lg border border-white/40 rotate-[15deg] translate-x-[6px]" />
                      <div className="relative w-10 h-13 bg-white rounded-lg flex items-center justify-center shadow-lg">
                         <svg viewBox="0 0 24 24" width="20" height="20" stroke="var(--primary)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                         </svg>
                      </div>
                   </div>
                </div>
                <div className="text-center">
                  <span className="block text-sm font-black text-gray-800 tracking-[0.3em] uppercase">Photos</span>
                  <span className="block text-[10px] font-bold text-primary mt-2">TAP TO UPLOAD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center relative z-20">
          <h2 className="font-black text-3xl mb-4 text-gray-900 tracking-tight">Select Property Photos</h2>
          <p className="text-gray-400 text-base max-w-sm mx-auto font-medium">
            Drag images here or <span className="text-primary font-bold hover:underline cursor-pointer">browse gallery</span>
          </p>
        </div>

        {isDragging && (
          <div className="absolute inset-0 bg-primary/5 backdrop-blur-[10px] z-30 flex items-center justify-center animate-fadeIn">
            <div className="bg-white/90 p-10 rounded-[3rem] shadow-2xl border border-primary/20 scale-110 transition-all">
               <div className="flex flex-col items-center gap-4">
                  <span className="text-6xl">📥</span>
                  <span className="text-2xl font-black text-primary">Release to Upload</span>
               </div>
            </div>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {images.map((url, i) => (
            <div 
              key={i} 
              className="group relative aspect-square rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-xl transition-all duration-700 hover:shadow-2xl hover:-translate-y-2 animate-fadeIn"
            >
              <button 
                type="button"
                className="absolute top-4 right-4 bg-red-600 text-white w-11 h-11 rounded-full flex items-center justify-center shadow-xl transition-all z-30 border-[3px] border-white hover:bg-red-700 hover:scale-110 active:scale-90"
                onClick={(e) => { e.stopPropagation(); removeImage(i) }}
              >
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
              </button>
              <img src={url} alt="Preview" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-5 left-5 bg-white/10 backdrop-blur-2xl text-white text-xs font-black px-4 py-2 rounded-2xl border border-white/20">
                PHOTO {i + 1}
              </div>
            </div>
          ))}
          {images.length < maxImages && (
            <button
              type="button"
              className="aspect-square rounded-[2.5rem] border-2 border-dashed border-gray-200 bg-gray-50/30 hover:border-primary/50 hover:bg-white transition-all duration-500 flex flex-col items-center justify-center gap-4 group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
              <span className="text-lg font-black text-gray-400 group-hover:text-primary transition-colors">Add More</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

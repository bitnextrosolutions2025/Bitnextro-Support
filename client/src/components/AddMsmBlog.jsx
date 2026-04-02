import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, X, Image as ImageIcon, CheckCircle, FileText } from 'lucide-react';
import axios from 'axios'
import { handleError, handleSuccess } from './ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import secureLocalStorage from 'react-secure-storage';
export default function AddMsmBlog() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userdata, setuserdata] = useState({})
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const naviget = useNavigate();
  useEffect(() => {
    const getoken = async () => {

      try {
        const token = secureLocalStorage.getItem("auth-token");
        // console.log(token)
        let finaldata;
        if (token) {
          const url = `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/getuser`;
          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "auth-token": token
            },
          });
          const data = await response.json();
          finaldata = data.message;
          setuserdata(data.message);
        }
        // console.log(finaldata.email);
        const blockedEmails = [
          "bitnextrosolutions@gmail.com",
          "rijwansk329@gmail.com",
          "d.bhoumik2020@gmail.com"
        ];

        if (
          blockedEmails.includes(user?.email) ||
          blockedEmails.includes(finaldata?.email)
        ) {
          return;
        }
        handleError("Invalid admin")
        return naviget("/adminbitnextro")
      } catch (error) {
        handleError("Invalid admin")
        console.log(error)
        return naviget("/adminbitnextro")

      }
    }
    getoken();
  }, [user]);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      setIsSubmitting(true);
      // console.log(imageFile, title, description)
      const formdata = new FormData();
      formdata.append("blogimage", imageFile)
      const bloginfo = {
        blog_title: title,
        blog_description: description,
      }
      formdata.append('bloginfo', JSON.stringify(bloginfo))
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/v6/blogMsm/add-blog`;

      const res = await axios.post(url, formdata, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // console.log(res)
      if (res.status) {
        setIsSubmitting(false);
        handleSuccess('Your blog post has been successfully created.')
        setTitle('');
        setDescription('');
        removeImage();
        return;
      }

      setIsSubmitting(false);
      handleError('Server error try again !')



    } catch (error) {
      console.log(error);
      setIsSubmitting(false);
      return handleError("Server error or image is too big ! Try again !")

    }

  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center font-sans">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">

        {/* Header Section */}
        <div className="bg-green-700 px-6 py-8 sm:p-10 text-center">
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
            <FileText className="w-8 h-8" />
            Create New Blog Post for Manmalka.
          </h2>
          <p className="mt-2 text-green-100 text-sm sm:text-base">
            Fill in the details below to publish a new article to your blog.
          </p>
        </div>

        {/* Form Section */}
        <div className="p-6 sm:p-10">

          {/* Success Message Box */}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1">
                Blog Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition-colors text-gray-800 bg-gray-50 focus:bg-white"
                placeholder="Enter a captivating title"
              />
            </div>

            {/* Description Input */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">
                Blog Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                required
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition-colors text-gray-800 bg-gray-50 focus:bg-white resize-y"
                placeholder="Write your blog content here..."
              />
            </div>

            {/* Image Upload Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Featured Image <span className='text-red-600'>*</span>
              </label>

              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-green-500 hover:bg-green-50/30 transition-all group relative">

                {previewUrl ? (
                  // Image Preview State
                  <div className="relative w-full">
                    <img
                      src={previewUrl}
                      alt="Blog preview"
                      className="w-full max-h-100 object-contain rounded-md"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-3 -right-3 bg-white text-gray-600 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-full shadow-md transition-colors"
                      title="Remove image"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  // Empty Upload State
                  <div className="space-y-2 text-center">
                    <div className="flex justify-center">
                      <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-200 transition-colors">
                        <ImageIcon className="mx-auto h-8 w-8 text-green-700" />
                      </div>
                    </div>
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label
                        htmlFor="blogimage"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-green-700 hover:text-green-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500 px-1"
                      >
                        <span>Upload a file</span>
                        <input
                          id="blogimage"
                          name="blogimage"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleImageChange}
                          ref={fileInputRef}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                // disabled={isSubmitting}
                disabled={true}
                className={`w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 transition-all ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Publishing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UploadCloud className="w-5 h-5" />
                    Publish Blog Post
                  </span>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}